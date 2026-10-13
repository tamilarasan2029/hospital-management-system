from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, AuditLogDTO
from app.services import audit_service
from app.deps import require_roles

router = APIRouter(prefix="/api/audit-log", tags=["audit"])


@router.get("", response_model=ApiResponse[List[AuditLogDTO]])
def get_all(entity_type: Optional[str] = None, user_id: Optional[int] = None,
            db: Session = Depends(get_db), _admin=Depends(require_roles("ADMIN"))):
    data = [AuditLogDTO.model_validate(a) for a in audit_service.get_all(db, entity_type, user_id)]
    return ApiResponse(status=200, message="Success", data=data)
