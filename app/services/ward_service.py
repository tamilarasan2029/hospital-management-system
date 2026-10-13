from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Ward, Bed, OTBooking, Patient, Doctor
from app.schemas import CreateWardDTO, CreateBedDTO, OTBookingDTO, CreateOTBookingDTO, UpdateOTBookingDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


# ---- Wards ----
def get_all_wards(db: Session):
    return db.query(Ward).all()


def create_ward(db: Session, dto: CreateWardDTO, current_user=None) -> Ward:
    ward = Ward(**dto.model_dump())
    db.add(ward)
    db.commit()
    db.refresh(ward)
    log_action(db, current_user, "CREATE", "Ward", ward.ward_id, ward.name)
    return ward


# ---- Beds ----
def get_all_beds(db: Session, ward_id: int = None, status: str = None):
    q = db.query(Bed)
    if ward_id:
        q = q.filter(Bed.ward_id == ward_id)
    if status:
        q = q.filter(Bed.status == status)
    return q.all()


def create_bed(db: Session, dto: CreateBedDTO, current_user=None) -> Bed:
    if not db.query(Ward).filter(Ward.ward_id == dto.ward_id).first():
        raise NotFoundError("Ward not found")
    bed = Bed(ward_id=dto.ward_id, bed_number=dto.bed_number, status="AVAILABLE")
    db.add(bed)
    db.commit()
    db.refresh(bed)
    log_action(db, current_user, "CREATE", "Bed", bed.bed_id, dto.bed_number)
    return bed


def admit_patient(db: Session, bed_id: int, patient_id: int, current_user=None) -> Bed:
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not bed:
        raise NotFoundError("Bed not found")
    if bed.status != "AVAILABLE":
        raise BusinessError(f"Bed is not available (currently {bed.status})")
    if not db.query(Patient).filter(Patient.patient_id == patient_id).first():
        raise NotFoundError("Patient not found")

    bed.status = "OCCUPIED"
    bed.patient_id = patient_id
    bed.admitted_at = datetime.utcnow()
    db.commit()
    db.refresh(bed)
    log_action(db, current_user, "UPDATE", "Bed", bed_id, f"Admitted patient {patient_id}")
    return bed


def discharge_patient(db: Session, bed_id: int, current_user=None) -> Bed:
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not bed:
        raise NotFoundError("Bed not found")
    if bed.status != "OCCUPIED":
        raise BusinessError("Bed is not currently occupied")

    bed.status = "AVAILABLE"
    bed.patient_id = None
    bed.admitted_at = None
    db.commit()
    db.refresh(bed)
    log_action(db, current_user, "UPDATE", "Bed", bed_id, "Discharged patient")
    return bed


# ---- OT Bookings ----
def _to_dto(booking: OTBooking) -> OTBookingDTO:
    return OTBookingDTO(
        ot_booking_id=booking.ot_booking_id,
        patient_id=booking.patient_id,
        patient_name=booking.patient.name if booking.patient else "",
        doctor_id=booking.doctor_id,
        doctor_name=booking.doctor.name if booking.doctor else "",
        ot_room=booking.ot_room,
        procedure_name=booking.procedure_name,
        scheduled_start=booking.scheduled_start,
        scheduled_end=booking.scheduled_end,
        status=booking.status,
        notes=booking.notes,
    )


def get_all_ot_bookings(db: Session):
    return [_to_dto(b) for b in db.query(OTBooking).order_by(OTBooking.scheduled_start).all()]


def _has_ot_conflict(db: Session, ot_room: str, start, end, exclude_id: int = None) -> bool:
    q = db.query(OTBooking).filter(OTBooking.ot_room == ot_room, OTBooking.status != "CANCELLED")
    if exclude_id:
        q = q.filter(OTBooking.ot_booking_id != exclude_id)
    for b in q.all():
        if b.scheduled_start < end and b.scheduled_end > start:
            return True
    return False


def create_ot_booking(db: Session, dto: CreateOTBookingDTO, current_user=None) -> OTBookingDTO:
    if not db.query(Patient).filter(Patient.patient_id == dto.patient_id).first():
        raise NotFoundError("Patient not found")
    if not db.query(Doctor).filter(Doctor.doctor_id == dto.doctor_id).first():
        raise NotFoundError("Doctor not found")
    if dto.scheduled_end <= dto.scheduled_start:
        raise BusinessError("End time must be after start time")
    if _has_ot_conflict(db, dto.ot_room, dto.scheduled_start, dto.scheduled_end):
        raise BusinessError(f"OT room {dto.ot_room} is already booked for an overlapping time")

    booking = OTBooking(
        patient_id=dto.patient_id, doctor_id=dto.doctor_id, ot_room=dto.ot_room,
        procedure_name=dto.procedure_name, scheduled_start=dto.scheduled_start,
        scheduled_end=dto.scheduled_end, notes=dto.notes, status="SCHEDULED",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    log_action(db, current_user, "CREATE", "OTBooking", booking.ot_booking_id,
               f"Booked {dto.ot_room} for {dto.procedure_name or 'procedure'}")
    return _to_dto(booking)


def update_ot_booking(db: Session, booking_id: int, dto: UpdateOTBookingDTO, current_user=None) -> OTBookingDTO:
    booking = db.query(OTBooking).filter(OTBooking.ot_booking_id == booking_id).first()
    if not booking:
        raise NotFoundError("OT booking not found")
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    log_action(db, current_user, "UPDATE", "OTBooking", booking_id)
    return _to_dto(booking)
