from datetime import timedelta, timezone
from sqlalchemy.orm import Session
from app.models import Appointment, Patient, Doctor
from app.schemas import AppointmentDTO, CreateAppointmentDTO, UpdateAppointmentDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


def _to_naive_utc(dt):
    """Strips timezone info, converting to naive UTC first if the incoming
    datetime is timezone-aware. The frontend sends ISO strings ending in 'Z'
    (e.g. from JS's toISOString()), which Pydantic parses as timezone-aware -
    but everything already stored in the database is naive. Comparing the
    two directly crashes with 'can't compare offset-naive and offset-aware
    datetimes', which is exactly the bug this fixes, at the single point
    where every incoming appointment time enters the system."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

from app.schemas import PublicBookDTO


def _to_dto(appointment: Appointment) -> AppointmentDTO:
    return AppointmentDTO(
        appointment_id=appointment.appointment_id,
        patient_id=appointment.patient.patient_id,
        patient_name=appointment.patient.name,
        doctor_id=appointment.doctor.doctor_id,
        doctor_name=appointment.doctor.name,
        appointment_date_time=appointment.appointment_date_time,
        duration_in_minutes=appointment.duration_in_minutes,
        reason=appointment.reason,
        notes=appointment.notes,
        status=appointment.status,
        diagnosis=appointment.diagnosis,
        prescription=appointment.prescription,
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
    )


def get_all_appointments(db: Session):
    return [_to_dto(a) for a in db.query(Appointment).all()]


def get_appointment_by_id(db: Session, appointment_id: int) -> AppointmentDTO:
    appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()
    if not appointment:
        raise NotFoundError("Appointment not found")
    return _to_dto(appointment)


def _has_conflict(db: Session, doctor_id: int, start, duration_minutes: int, exclude_id: int = None) -> bool:
    """Real overlap check: two time ranges [start, end) conflict if they overlap at all,
    not just if they share the exact same slot start."""
    start = _to_naive_utc(start)
    end = start + timedelta(minutes=duration_minutes)
    q = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "CANCELLED",
    )
    if exclude_id:
        q = q.filter(Appointment.appointment_id != exclude_id)

    for existing in q.all():
        existing_start = existing.appointment_date_time
        existing_end = existing_start + timedelta(minutes=existing.duration_in_minutes or 30)
        # Overlap if existing starts before our end AND existing ends after our start
        if existing_start < end and existing_end > start:
            return True
    return False


def create_appointment(db: Session, dto: CreateAppointmentDTO, current_user=None) -> AppointmentDTO:
    patient = db.query(Patient).filter(Patient.patient_id == dto.patient_id).first()
    if not patient:
        raise NotFoundError("Patient not found")

    doctor = db.query(Doctor).filter(Doctor.doctor_id == dto.doctor_id).first()
    if not doctor:
        raise NotFoundError("Doctor not found")

    if doctor.status != "AVAILABLE":
        raise BusinessError("Doctor is not available")

    duration = dto.duration_in_minutes if dto.duration_in_minutes is not None else 30
    appointment_time = _to_naive_utc(dto.appointment_date_time)

    if _has_conflict(db, dto.doctor_id, appointment_time, duration):
        raise BusinessError("Time slot overlaps with an existing appointment for this doctor")

    appointment = Appointment(
        patient_id=patient.patient_id,
        doctor_id=doctor.doctor_id,
        appointment_date_time=appointment_time,
        duration_in_minutes=duration,
        reason=dto.reason,
        notes=dto.notes,
        status="SCHEDULED",
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    log_action(db, current_user, "CREATE", "Appointment", appointment.appointment_id,
               f"Booked appointment for patient {patient.name} with Dr. {doctor.name}")
    return _to_dto(appointment)


def update_appointment(db: Session, appointment_id: int, dto: UpdateAppointmentDTO, current_user=None) -> AppointmentDTO:
    appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()
    if not appointment:
        raise NotFoundError("Appointment not found")

    if dto.appointment_date_time is not None:
        new_time = _to_naive_utc(dto.appointment_date_time)
        new_duration = appointment.duration_in_minutes
        if _has_conflict(db, appointment.doctor_id, new_time, new_duration, exclude_id=appointment_id):
            raise BusinessError("New time slot overlaps with an existing appointment for this doctor")
        appointment.appointment_date_time = new_time

    for field in ("reason", "notes", "status", "diagnosis", "prescription"):
        value = getattr(dto, field)
        if value is not None:
            setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    log_action(db, current_user, "UPDATE", "Appointment", appointment_id)
    return _to_dto(appointment)


def delete_appointment(db: Session, appointment_id: int, current_user=None) -> None:
    appointment = db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()
    if not appointment:
        raise NotFoundError("Appointment not found")
    db.delete(appointment)
    db.commit()
    log_action(db, current_user, "DELETE", "Appointment", appointment_id)


def get_patient_appointments(db: Session, patient_id: int):
    rows = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    return [_to_dto(a) for a in rows]


def get_doctor_appointments(db: Session, doctor_id: int):
    rows = db.query(Appointment).filter(Appointment.doctor_id == doctor_id).all()
    return [_to_dto(a) for a in rows]


def get_appointments_by_status(db: Session, status: str):
    rows = db.query(Appointment).filter(Appointment.status == status).all()
    return [_to_dto(a) for a in rows]


def get_doctor_available_slots(db: Session, doctor_id: int, day, slot_minutes: int = 30,
                                work_start_hour: int = 9, work_end_hour: int = 17):
    """Real scheduling logic (item 10): given a date, generate the doctor's working-hour
    slots and remove any that overlap an existing (non-cancelled) appointment."""
    from datetime import datetime as dt, time as dtime

    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise NotFoundError("Doctor not found")

    day_start = dt.combine(day, dtime(hour=work_start_hour))
    day_end = dt.combine(day, dtime(hour=work_end_hour))

    existing = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.status != "CANCELLED",
        Appointment.appointment_date_time >= day_start,
        Appointment.appointment_date_time < day_end,
    ).all()
    busy_ranges = [
        (a.appointment_date_time, a.appointment_date_time + timedelta(minutes=a.duration_in_minutes or 30))
        for a in existing
    ]

    slots = []
    cursor = day_start
    while cursor + timedelta(minutes=slot_minutes) <= day_end:
        slot_end = cursor + timedelta(minutes=slot_minutes)
        overlaps = any(b_start < slot_end and b_end > cursor for b_start, b_end in busy_ranges)
        if not overlaps:
            slots.append(cursor)
        cursor += timedelta(minutes=slot_minutes)

    return slots

def public_book(db: Session, dto: PublicBookDTO) -> AppointmentDTO:
    """Books a visit for a visitor who is not logged in. Finds the patient by email,
    or creates one. Existing patient records are never changed here."""
    email = dto.email.lower().strip()
    name = dto.name.strip()
    patient = db.query(Patient).filter(Patient.email == email).first()
    if not patient:
        patient = Patient(
            name=name, email=email, phone=dto.phone.strip(),
            date_of_birth=dto.date_of_birth, gender=dto.gender,
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    booked = create_appointment(db, CreateAppointmentDTO(
        patient_id=patient.patient_id,
        doctor_id=dto.doctor_id,
        appointment_date_time=dto.appointment_date_time,
        reason=dto.reason.strip(),
    ))
    booked.patient_name = name
    return booked