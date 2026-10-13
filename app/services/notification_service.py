from sqlalchemy.orm import Session
from app.models import Notification
from app.exceptions import NotFoundError


def get_all(db: Session, unread_only: bool = False):
    q = db.query(Notification)
    if unread_only:
        q = q.filter(Notification.is_read == False)  # noqa: E712
    return q.order_by(Notification.created_at.desc()).all()


def mark_read(db: Session, notification_id: int):
    n = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if not n:
        raise NotFoundError("Notification not found")
    n.is_read = True
    db.commit()
    db.refresh(n)
    return n


def mark_all_read(db: Session):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})  # noqa: E712
    db.commit()
