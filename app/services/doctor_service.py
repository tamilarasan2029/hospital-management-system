from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Doctor
from app.schemas import CreateDoctorDTO, UpdateDoctorDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


def get_all_doctors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Doctor).offset(skip).limit(limit).all()


def get_doctor_by_id(db: Session, doctor_id: int) -> Doctor:
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise NotFoundError("Doctor not found")
    return doctor


def create_doctor(db: Session, dto: CreateDoctorDTO, current_user=None) -> Doctor:
    existing = db.query(Doctor).filter(Doctor.email == dto.email).first()
    if existing:
        raise BusinessError("Doctor with this email already exists")

    doctor = Doctor(
        name=dto.name, email=dto.email, phone=dto.phone, specialization=dto.specialization,
        years_of_experience=dto.years_of_experience, qualifications=dto.qualifications,
        bio=dto.bio, office=dto.office, consultation_fee=dto.consultation_fee, status="AVAILABLE",
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    log_action(db, current_user, "CREATE", "Doctor", doctor.doctor_id, f"Created doctor {doctor.name}")
    return doctor


def update_doctor(db: Session, doctor_id: int, dto: UpdateDoctorDTO, current_user=None) -> Doctor:
    doctor = get_doctor_by_id(db, doctor_id)
    for field in ("name", "phone", "bio", "consultation_fee", "status"):
        value = getattr(dto, field)
        if value is not None:
            setattr(doctor, field, value)
    db.commit()
    db.refresh(doctor)
    log_action(db, current_user, "UPDATE", "Doctor", doctor_id)
    return doctor


def delete_doctor(db: Session, doctor_id: int, current_user=None) -> None:
    doctor = db.query(Doctor).filter(Doctor.doctor_id == doctor_id).first()
    if not doctor:
        raise NotFoundError("Doctor not found")
    db.delete(doctor)
    db.commit()
    log_action(db, current_user, "DELETE", "Doctor", doctor_id, f"Deleted doctor {doctor.name}")


def get_doctors_by_specialization(db: Session, specialization: str):
    return db.query(Doctor).filter(Doctor.specialization == specialization).all()


def search_doctors(db: Session, name: str = None, specialization: str = None,
                    status: str = None, min_experience: int = None):
    q = db.query(Doctor)
    if name:
        q = q.filter(func.lower(Doctor.name).contains(name.lower()))
    if specialization:
        q = q.filter(Doctor.specialization == specialization)
    if status:
        q = q.filter(Doctor.status == status)
    if min_experience is not None:
        q = q.filter(Doctor.years_of_experience >= min_experience)
    return q.all()


def get_available_doctors(db: Session):
    return db.query(Doctor).filter(Doctor.status == "AVAILABLE").all()
