from sqlalchemy.orm import Session
from app.models import PatientAccount, Patient, Appointment, Billing, MedicalRecord, Prescription, LabOrder
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


def link_account(db: Session, user, patient_id: int) -> PatientAccount:
    if not db.query(Patient).filter(Patient.patient_id == patient_id).first():
        raise NotFoundError("Patient not found")
    existing = db.query(PatientAccount).filter(PatientAccount.user_id == user.user_id).first()
    if existing:
        raise BusinessError("This account is already linked to a patient record")
    if db.query(PatientAccount).filter(PatientAccount.patient_id == patient_id).first():
        raise BusinessError("This patient record is already linked to another account")

    link = PatientAccount(user_id=user.user_id, patient_id=patient_id)
    db.add(link)
    db.commit()
    db.refresh(link)
    log_action(db, user, "CREATE", "PatientAccount", user.user_id, f"Linked to patient {patient_id}")
    return link


def _get_linked_patient_id(db: Session, user) -> int:
    link = db.query(PatientAccount).filter(PatientAccount.user_id == user.user_id).first()
    if not link:
        raise BusinessError("Your account isn't linked to a patient record yet. Contact the hospital to link it.")
    return link.patient_id


def get_my_profile(db: Session, user):
    patient_id = _get_linked_patient_id(db, user)
    return db.query(Patient).filter(Patient.patient_id == patient_id).first()


def get_my_appointments(db: Session, user):
    patient_id = _get_linked_patient_id(db, user)
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).order_by(
        Appointment.appointment_date_time.desc()
    ).all()


def get_my_bills(db: Session, user):
    patient_id = _get_linked_patient_id(db, user)
    return db.query(Billing).filter(Billing.patient_id == patient_id).order_by(Billing.created_at.desc()).all()


def get_my_medical_records(db: Session, user):
    patient_id = _get_linked_patient_id(db, user)
    return db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(
        MedicalRecord.created_at.desc()
    ).all()


def get_my_prescriptions(db: Session, user):
    patient_id = _get_linked_patient_id(db, user)
    return db.query(Prescription).filter(Prescription.patient_id == patient_id).order_by(
        Prescription.created_at.desc()
    ).all()


def get_my_lab_orders(db: Session, user):
    patient_id = _get_linked_patient_id(db, user)
    return db.query(LabOrder).filter(LabOrder.patient_id == patient_id).order_by(
        LabOrder.ordered_at.desc()
    ).all()
