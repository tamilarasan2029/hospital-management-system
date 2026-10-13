from sqlalchemy.orm import Session
from app.models import AuditLog


def log_action(db: Session, user, action: str, entity_type: str, entity_id=None, details: str = None):
    """Record an audit trail entry. `user` may be None for unauthenticated/system actions."""
    entry = AuditLog(
        user_id=getattr(user, "user_id", None),
        username=getattr(user, "username", None),
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        details=details,
    )
    db.add(entry)
    db.commit()
