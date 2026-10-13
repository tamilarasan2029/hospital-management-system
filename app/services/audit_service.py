from sqlalchemy.orm import Session
from app.models import AuditLog


def get_all(db: Session, entity_type: str = None, user_id: int = None, limit: int = 200):
    q = db.query(AuditLog)
    if entity_type:
        q = q.filter(AuditLog.entity_type == entity_type)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    return q.order_by(AuditLog.created_at.desc()).limit(limit).all()
