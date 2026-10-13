from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models import QueueEntry, Patient, Doctor
from app.schemas import QueueEntryDTO, CreateQueueEntryDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


def _to_dto(entry: QueueEntry) -> QueueEntryDTO:
    return QueueEntryDTO(
        queue_id=entry.queue_id,
        patient_id=entry.patient_id,
        patient_name=entry.patient.name if entry.patient else "",
        doctor_id=entry.doctor_id,
        doctor_name=entry.doctor.name if entry.doctor else "",
        token_number=entry.token_number,
        status=entry.status,
        checked_in_at=entry.checked_in_at,
        called_at=entry.called_at,
        completed_at=entry.completed_at,
    )


def check_in(db: Session, dto: CreateQueueEntryDTO, current_user=None) -> QueueEntryDTO:
    patient = db.query(Patient).filter(Patient.patient_id == dto.patient_id).first()
    if not patient:
        raise NotFoundError("Patient not found")
    doctor = db.query(Doctor).filter(Doctor.doctor_id == dto.doctor_id).first()
    if not doctor:
        raise NotFoundError("Doctor not found")

    today_start = datetime.combine(date.today(), datetime.min.time())
    todays_count = db.query(QueueEntry).filter(
        QueueEntry.doctor_id == dto.doctor_id,
        QueueEntry.checked_in_at >= today_start,
    ).count()

    entry = QueueEntry(
        patient_id=dto.patient_id,
        doctor_id=dto.doctor_id,
        token_number=todays_count + 1,
        status="WAITING",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    log_action(db, current_user, "CREATE", "QueueEntry", entry.queue_id,
               f"Checked in {patient.name} for Dr. {doctor.name} (token #{entry.token_number})")
    return _to_dto(entry)


def get_queue_for_doctor(db: Session, doctor_id: int, active_only: bool = True):
    q = db.query(QueueEntry).filter(QueueEntry.doctor_id == doctor_id)
    if active_only:
        q = q.filter(QueueEntry.status.in_(["WAITING", "IN_PROGRESS"]))
    rows = q.order_by(QueueEntry.token_number).all()
    return [_to_dto(e) for e in rows]


def call_next(db: Session, doctor_id: int, current_user=None) -> QueueEntryDTO:
    entry = db.query(QueueEntry).filter(
        QueueEntry.doctor_id == doctor_id, QueueEntry.status == "WAITING"
    ).order_by(QueueEntry.token_number).first()
    if not entry:
        raise NotFoundError("No one waiting in queue for this doctor")

    entry.status = "IN_PROGRESS"
    entry.called_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    log_action(db, current_user, "UPDATE", "QueueEntry", entry.queue_id, "Called next patient")
    return _to_dto(entry)


def update_status(db: Session, queue_id: int, status: str, current_user=None) -> QueueEntryDTO:
    entry = db.query(QueueEntry).filter(QueueEntry.queue_id == queue_id).first()
    if not entry:
        raise NotFoundError("Queue entry not found")
    if status == "COMPLETED":
        status = "DONE"  # the frontend's "Mark Completed" button sends this
    if status not in ("WAITING", "IN_PROGRESS", "DONE", "SKIPPED"):
        raise BusinessError("Invalid status")

    entry.status = status
    if status == "DONE":
        entry.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    log_action(db, current_user, "UPDATE", "QueueEntry", queue_id, f"Status -> {status}")
    return _to_dto(entry)
