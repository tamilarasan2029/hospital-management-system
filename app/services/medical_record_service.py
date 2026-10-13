from sqlalchemy.orm import Session
from app.models import MedicalRecord
from app.schemas import CreateMedicalRecordDTO, UpdateMedicalRecordDTO
from app.exceptions import NotFoundError
from app.utils.audit import log_action


def get_by_patient(db: Session, patient_id: int):
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(
        MedicalRecord.created_at.desc()
    ).all()


def get_by_id(db: Session, record_id: int) -> MedicalRecord:
    record = db.query(MedicalRecord).filter(MedicalRecord.record_id == record_id).first()
    if not record:
        raise NotFoundError("Medical record not found")
    return record


def create(db: Session, dto: CreateMedicalRecordDTO, current_user=None) -> MedicalRecord:
    record = MedicalRecord(**dto.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    log_action(db, current_user, "CREATE", "MedicalRecord", record.record_id)
    return record


def update(db: Session, record_id: int, dto: UpdateMedicalRecordDTO, current_user=None) -> MedicalRecord:
    record = get_by_id(db, record_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    log_action(db, current_user, "UPDATE", "MedicalRecord", record_id)
    return record


def delete(db: Session, record_id: int, current_user=None) -> None:
    record = get_by_id(db, record_id)
    db.delete(record)
    db.commit()
    log_action(db, current_user, "DELETE", "MedicalRecord", record_id)
