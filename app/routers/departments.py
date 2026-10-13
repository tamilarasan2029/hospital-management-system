from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, DepartmentDTO, CreateDepartmentDTO, UpdateDepartmentDTO
from app.services import department_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=ApiResponse[List[DepartmentDTO]])
def get_all(db: Session = Depends(get_db)):
    data = [DepartmentDTO.model_validate(d) for d in department_service.get_all(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{department_id}", response_model=ApiResponse[DepartmentDTO])
def get_one(department_id: int, db: Session = Depends(get_db)):
    d = department_service.get_by_id(db, department_id)
    return ApiResponse(status=200, message="Success", data=DepartmentDTO.model_validate(d))


@router.post("", response_model=ApiResponse[DepartmentDTO], status_code=201)
def create(dto: CreateDepartmentDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    d = department_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Department created", data=DepartmentDTO.model_validate(d))


@router.put("/{department_id}", response_model=ApiResponse[DepartmentDTO])
def update(department_id: int, dto: UpdateDepartmentDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    d = department_service.update(db, department_id, dto, current_user)
    return ApiResponse(status=200, message="Department updated", data=DepartmentDTO.model_validate(d))


@router.delete("/{department_id}", response_model=ApiResponse[None])
def delete(department_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    department_service.delete(db, department_id, current_user)
    return ApiResponse(status=200, message="Department deleted", data=None)
