from sqlalchemy.orm import Session
from app.models import Prescription
from app.schemas import CreatePrescriptionDTO
from app.exceptions import NotFoundError
from app.utils.audit import log_action


def get_by_patient(db: Session, patient_id: int):
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(
        Prescription.created_at.desc()
    ).all()


def get_by_appointment(db: Session, appointment_id: int):
    return db.query(Prescription).filter(Prescription.appointment_id == appointment_id).all()


def get_by_id(db: Session, prescription_id: int) -> Prescription:
    p = db.query(Prescription).filter(Prescription.prescription_id == prescription_id).first()
    if not p:
        raise NotFoundError("Prescription not found")
    return p


def create(db: Session, dto: CreatePrescriptionDTO, current_user=None) -> Prescription:
    p = Prescription(**dto.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    log_action(db, current_user, "CREATE", "Prescription", p.prescription_id)
    return p


def delete(db: Session, prescription_id: int, current_user=None) -> None:
    p = get_by_id(db, prescription_id)
    db.delete(p)
    db.commit()
    log_action(db, current_user, "DELETE", "Prescription", prescription_id)
