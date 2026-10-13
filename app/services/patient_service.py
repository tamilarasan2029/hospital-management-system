from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from app.models import (
    Patient, Appointment, Billing, MedicalRecord, Prescription, UploadedFile,
    QueueEntry, LabOrder, PharmacyDispense, Bed, OTBooking, InsuranceClaim, PatientAccount,
)
from app.schemas import CreatePatientDTO, UpdatePatientDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action

# Every table with a patient_id foreign key. Delete is blocked if any row exists.
PATIENT_DEPENDENTS = [
    ("appointment(s)", Appointment),
    ("bill(s)", Billing),
    ("medical record(s)", MedicalRecord),
    ("prescription(s)", Prescription),
    ("uploaded file(s)", UploadedFile),
    ("queue entry(ies)", QueueEntry),
    ("lab order(s)", LabOrder),
    ("pharmacy dispense(s)", PharmacyDispense),
    ("bed admission(s)", Bed),
    ("OT booking(s)", OTBooking),
    ("insurance claim(s)", InsuranceClaim),
    ("patient account link(s)", PatientAccount),
]


def get_all_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Patient).offset(skip).limit(limit).all()


def get_patient_by_id(db: Session, patient_id: int) -> Patient:
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise NotFoundError("Patient not found")
    return patient


def create_patient(db: Session, dto: CreatePatientDTO, current_user=None) -> Patient:
    existing = db.query(Patient).filter(Patient.email == dto.email).first()
    if existing:
        raise BusinessError("Patient with this email already exists")

    patient = Patient(
        name=dto.name, email=dto.email, phone=dto.phone, date_of_birth=dto.date_of_birth,
        gender=dto.gender, blood_type=dto.blood_type, medical_history=dto.medical_history,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    log_action(db, current_user, "CREATE", "Patient", patient.patient_id, f"Created patient {patient.name}")
    return patient


def update_patient(db: Session, patient_id: int, dto: UpdatePatientDTO, current_user=None) -> Patient:
    patient = get_patient_by_id(db, patient_id)

    if dto.email is not None and dto.email != patient.email:
        clash = db.query(Patient).filter(
            Patient.email == dto.email, Patient.patient_id != patient_id
        ).first()
        if clash:
            raise BusinessError("Another patient already uses this email")

    for field in ("name", "email", "phone", "gender", "date_of_birth", "blood_type", "medical_history"):
        value = getattr(dto, field)
        if value is not None:
            setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    log_action(db, current_user, "UPDATE", "Patient", patient_id)
    return patient


def delete_patient(db: Session, patient_id: int, current_user=None) -> None:
    """Deletes a patient only if nothing clinical, financial or operational
    still points at them. Checks every table that references patients, so
    the database never throws a foreign-key error on delete."""
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise NotFoundError("Patient not found")

    linked = []
    for label, model in PATIENT_DEPENDENTS:
        count = db.query(model).filter(model.patient_id == patient_id).count()
        if count:
            linked.append(f"{count} {label}")
    if linked:
        raise BusinessError(
            f"Cannot delete {patient.name}: still linked to " + ", ".join(linked)
            + ". Remove or close those records first."
        )

    name = patient.name
    try:
        db.delete(patient)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise BusinessError(f"Cannot delete {name}: other records still reference this patient.")
    log_action(db, current_user, "DELETE", "Patient", patient_id, f"Deleted patient {name}")


def search_patients(db: Session, name: str = None, blood_type: str = None,
                     gender: str = None, skip: int = 0, limit: int = 100):
    """Advanced filtering: any combination of name/blood_type/gender."""
    q = db.query(Patient)
    if name:
        q = q.filter(func.lower(Patient.name).contains(name.lower()))
    if blood_type:
        q = q.filter(Patient.blood_type == blood_type)
    if gender:
        q = q.filter(Patient.gender == gender)
    return q.offset(skip).limit(limit).all()
