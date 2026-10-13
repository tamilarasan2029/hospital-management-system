from sqlalchemy.orm import Session
from app.models import Staff
from app.schemas import CreateStaffDTO, UpdateStaffDTO
from app.exceptions import NotFoundError
from app.utils.audit import log_action


def get_all(db: Session):
    return db.query(Staff).all()


def get_by_id(db: Session, staff_id: int) -> Staff:
    s = db.query(Staff).filter(Staff.staff_id == staff_id).first()
    if not s:
        raise NotFoundError("Staff member not found")
    return s


def create(db: Session, dto: CreateStaffDTO, current_user=None) -> Staff:
    s = Staff(**dto.model_dump(), status="ACTIVE")
    db.add(s)
    db.commit()
    db.refresh(s)
    log_action(db, current_user, "CREATE", "Staff", s.staff_id, s.name)
    return s


def update(db: Session, staff_id: int, dto: UpdateStaffDTO, current_user=None) -> Staff:
    s = get_by_id(db, staff_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    log_action(db, current_user, "UPDATE", "Staff", staff_id)
    return s


def delete(db: Session, staff_id: int, current_user=None) -> None:
    s = get_by_id(db, staff_id)
    db.delete(s)
    db.commit()
    log_action(db, current_user, "DELETE", "Staff", staff_id)
