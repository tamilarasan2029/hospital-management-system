from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, StaffDTO, CreateStaffDTO, UpdateStaffDTO
from app.services import staff_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/staff", tags=["staff"])


@router.get("", response_model=ApiResponse[List[StaffDTO]])
def get_all(db: Session = Depends(get_db)):
    data = [StaffDTO.model_validate(s) for s in staff_service.get_all(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{staff_id}", response_model=ApiResponse[StaffDTO])
def get_one(staff_id: int, db: Session = Depends(get_db)):
    s = staff_service.get_by_id(db, staff_id)
    return ApiResponse(status=200, message="Success", data=StaffDTO.model_validate(s))


@router.post("", response_model=ApiResponse[StaffDTO], status_code=201)
def create(dto: CreateStaffDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    s = staff_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Staff member added", data=StaffDTO.model_validate(s))


@router.put("/{staff_id}", response_model=ApiResponse[StaffDTO])
def update(staff_id: int, dto: UpdateStaffDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    s = staff_service.update(db, staff_id, dto, current_user)
    return ApiResponse(status=200, message="Staff member updated", data=StaffDTO.model_validate(s))


@router.delete("/{staff_id}", response_model=ApiResponse[None])
def delete(staff_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    staff_service.delete(db, staff_id, current_user)
    return ApiResponse(status=200, message="Staff member removed", data=None)
