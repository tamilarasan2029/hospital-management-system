from datetime import datetime
from sqlalchemy.orm import Session
from app.models import LabOrder, Patient, Doctor
from app.schemas import CreateLabOrderDTO, UpdateLabResultDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action
from app.utils.notifications import create_notification

VALID_TEST_TYPES = {"LAB", "RADIOLOGY"}


def create_order(db: Session, dto: CreateLabOrderDTO, current_user=None) -> LabOrder:
    if not db.query(Patient).filter(Patient.patient_id == dto.patient_id).first():
        raise NotFoundError("Patient not found")
    if not db.query(Doctor).filter(Doctor.doctor_id == dto.doctor_id).first():
        raise NotFoundError("Doctor not found")
    if dto.test_type.upper() not in VALID_TEST_TYPES:
        raise BusinessError("test_type must be LAB or RADIOLOGY")

    order = LabOrder(
        patient_id=dto.patient_id, doctor_id=dto.doctor_id, appointment_id=dto.appointment_id,
        test_type=dto.test_type.upper(), test_name=dto.test_name, status="ORDERED",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    log_action(db, current_user, "CREATE", "LabOrder", order.order_id, dto.test_name)
    return order


def get_by_id(db: Session, order_id: int) -> LabOrder:
    order = db.query(LabOrder).filter(LabOrder.order_id == order_id).first()
    if not order:
        raise NotFoundError("Lab/Radiology order not found")
    return order


def get_by_patient(db: Session, patient_id: int):
    return db.query(LabOrder).filter(LabOrder.patient_id == patient_id).order_by(
        LabOrder.ordered_at.desc()
    ).all()


def get_by_doctor(db: Session, doctor_id: int, status: str = None):
    q = db.query(LabOrder).filter(LabOrder.doctor_id == doctor_id)
    if status:
        q = q.filter(LabOrder.status == status)
    return q.order_by(LabOrder.ordered_at.desc()).all()


def update_result(db: Session, order_id: int, dto: UpdateLabResultDTO, current_user=None) -> LabOrder:
    order = get_by_id(db, order_id)
    was_completed = order.status == "COMPLETED"

    for field in ("status", "result_text", "result_file_id"):
        value = getattr(dto, field)
        if value is not None:
            setattr(order, field, value)

    if order.status == "COMPLETED" and not was_completed:
        order.completed_at = datetime.utcnow()
        # This is the "result routing" - the ordering doctor gets notified
        # the moment a result lands, instead of having to keep checking.
        create_notification(
            db, "LAB_RESULT_READY", "Result ready",
            f"{order.test_type} result for '{order.test_name}' (order #{order.order_id}) is ready.",
            reference_type="LabOrder", reference_id=order.order_id,
        )

    db.commit()
    db.refresh(order)
    log_action(db, current_user, "UPDATE", "LabOrder", order_id)
    return order


def delete_order(db: Session, order_id: int, current_user=None) -> None:
    order = get_by_id(db, order_id)
    db.delete(order)
    db.commit()
    log_action(db, current_user, "DELETE", "LabOrder", order_id)
