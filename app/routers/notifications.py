from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, NotificationDTO
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=ApiResponse[List[NotificationDTO]])
def get_all(unread_only: bool = False, db: Session = Depends(get_db)):
    data = [NotificationDTO.model_validate(n) for n in notification_service.get_all(db, unread_only)]
    return ApiResponse(status=200, message="Success", data=data)


@router.put("/{notification_id}/read", response_model=ApiResponse[NotificationDTO])
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    n = notification_service.mark_read(db, notification_id)
    return ApiResponse(status=200, message="Marked as read", data=NotificationDTO.model_validate(n))


@router.put("/read-all", response_model=ApiResponse[None])
def mark_all_read(db: Session = Depends(get_db)):
    notification_service.mark_all_read(db)
    return ApiResponse(status=200, message="All notifications marked as read", data=None)
