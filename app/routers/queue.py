from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, QueueEntryDTO, CreateQueueEntryDTO
from app.services import queue_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/queue", tags=["queue"])


@router.post("/check-in", response_model=ApiResponse[QueueEntryDTO], status_code=201)
def check_in(dto: CreateQueueEntryDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    entry = queue_service.check_in(db, dto, current_user)
    return ApiResponse(status=201, message="Checked in", data=entry)


@router.get("/doctor/{doctor_id}", response_model=ApiResponse[List[QueueEntryDTO]])
def get_queue(doctor_id: int, active_only: bool = True, db: Session = Depends(get_db)):
    data = queue_service.get_queue_for_doctor(db, doctor_id, active_only)
    return ApiResponse(status=200, message="Success", data=data)


@router.put("/doctor/{doctor_id}/call-next", response_model=ApiResponse[QueueEntryDTO])
def call_next(doctor_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    entry = queue_service.call_next(db, doctor_id, current_user)
    return ApiResponse(status=200, message="Next patient called", data=entry)


@router.put("/{queue_id}/status", response_model=ApiResponse[QueueEntryDTO])
def update_status(queue_id: int, status: str, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user_optional)):
    entry = queue_service.update_status(db, queue_id, status, current_user)
    return ApiResponse(status=200, message="Status updated", data=entry)
