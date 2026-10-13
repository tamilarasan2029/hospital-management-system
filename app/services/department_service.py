from sqlalchemy.orm import Session
from app.models import Department
from app.schemas import CreateDepartmentDTO, UpdateDepartmentDTO
from app.exceptions import NotFoundError
from app.utils.audit import log_action


def get_all(db: Session):
    return db.query(Department).all()


def get_by_id(db: Session, department_id: int) -> Department:
    dept = db.query(Department).filter(Department.department_id == department_id).first()
    if not dept:
        raise NotFoundError("Department not found")
    return dept


def create(db: Session, dto: CreateDepartmentDTO, current_user=None) -> Department:
    dept = Department(**dto.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    log_action(db, current_user, "CREATE", "Department", dept.department_id, dept.name)
    return dept


def update(db: Session, department_id: int, dto: UpdateDepartmentDTO, current_user=None) -> Department:
    dept = get_by_id(db, department_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    log_action(db, current_user, "UPDATE", "Department", department_id)
    return dept


def delete(db: Session, department_id: int, current_user=None) -> None:
    dept = get_by_id(db, department_id)
    db.delete(dept)
    db.commit()
    log_action(db, current_user, "DELETE", "Department", department_id)
