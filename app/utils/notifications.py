from sqlalchemy.orm import Session
from app.models import Notification


def create_notification(db: Session, type_: str, title: str, message: str,
                         reference_type: str = None, reference_id: int = None):
    notif = Notification(
        type=type_,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
