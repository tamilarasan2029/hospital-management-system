from sqlalchemy.orm import Session
from app.models import Equipment
from app.schemas import CreateEquipmentDTO, UpdateEquipmentDTO
from app.exceptions import NotFoundError
from app.utils.audit import log_action
from app.utils.notifications import create_notification

LOW_STOCK_THRESHOLD = 2


def get_all(db: Session):
    return db.query(Equipment).all()


def get_by_id(db: Session, equipment_id: int) -> Equipment:
    eq = db.query(Equipment).filter(Equipment.equipment_id == equipment_id).first()
    if not eq:
        raise NotFoundError("Equipment not found")
    return eq


def create(db: Session, dto: CreateEquipmentDTO, current_user=None) -> Equipment:
    eq = Equipment(**dto.model_dump())
    db.add(eq)
    db.commit()
    db.refresh(eq)
    log_action(db, current_user, "CREATE", "Equipment", eq.equipment_id, eq.name)
    return eq


def update(db: Session, equipment_id: int, dto: UpdateEquipmentDTO, current_user=None) -> Equipment:
    eq = get_by_id(db, equipment_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(eq, field, value)
    db.commit()
    db.refresh(eq)

    if eq.quantity is not None and eq.quantity <= LOW_STOCK_THRESHOLD:
        create_notification(
            db, "LOW_STOCK", "Low equipment stock",
            f"{eq.name} is running low (qty: {eq.quantity}).",
            reference_type="Equipment", reference_id=eq.equipment_id,
        )

    log_action(db, current_user, "UPDATE", "Equipment", equipment_id)
    return eq


def delete(db: Session, equipment_id: int, current_user=None) -> None:
    eq = get_by_id(db, equipment_id)
    db.delete(eq)
    db.commit()
    log_action(db, current_user, "DELETE", "Equipment", equipment_id)


def get_low_stock(db: Session):
    return db.query(Equipment).filter(Equipment.quantity <= LOW_STOCK_THRESHOLD).all()
