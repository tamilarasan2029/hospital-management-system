from sqlalchemy.orm import Session
from app.models import ServiceCatalog
from app.schemas import CreateServiceCatalogDTO, UpdateServiceCatalogDTO
from app.exceptions import NotFoundError
from app.utils.audit import log_action


def get_all(db: Session):
    return db.query(ServiceCatalog).all()


def get_by_id(db: Session, service_id: int) -> ServiceCatalog:
    s = db.query(ServiceCatalog).filter(ServiceCatalog.service_id == service_id).first()
    if not s:
        raise NotFoundError("Service not found")
    return s


def create(db: Session, dto: CreateServiceCatalogDTO, current_user=None) -> ServiceCatalog:
    s = ServiceCatalog(**dto.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    log_action(db, current_user, "CREATE", "ServiceCatalog", s.service_id, s.name)
    return s


def update(db: Session, service_id: int, dto: UpdateServiceCatalogDTO, current_user=None) -> ServiceCatalog:
    s = get_by_id(db, service_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    log_action(db, current_user, "UPDATE", "ServiceCatalog", service_id)
    return s


def delete(db: Session, service_id: int, current_user=None) -> None:
    s = get_by_id(db, service_id)
    db.delete(s)
    db.commit()
    log_action(db, current_user, "DELETE", "ServiceCatalog", service_id)
