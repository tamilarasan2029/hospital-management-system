from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, EquipmentDTO, CreateEquipmentDTO, UpdateEquipmentDTO
from app.services import equipment_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/equipment", tags=["equipment"])


@router.get("", response_model=ApiResponse[List[EquipmentDTO]])
def get_all(db: Session = Depends(get_db)):
    data = [EquipmentDTO.model_validate(e) for e in equipment_service.get_all(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/low-stock", response_model=ApiResponse[List[EquipmentDTO]])
def low_stock(db: Session = Depends(get_db)):
    data = [EquipmentDTO.model_validate(e) for e in equipment_service.get_low_stock(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{equipment_id}", response_model=ApiResponse[EquipmentDTO])
def get_one(equipment_id: int, db: Session = Depends(get_db)):
    e = equipment_service.get_by_id(db, equipment_id)
    return ApiResponse(status=200, message="Success", data=EquipmentDTO.model_validate(e))


@router.post("", response_model=ApiResponse[EquipmentDTO], status_code=201)
def create(dto: CreateEquipmentDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    e = equipment_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Equipment added", data=EquipmentDTO.model_validate(e))


@router.put("/{equipment_id}", response_model=ApiResponse[EquipmentDTO])
def update(equipment_id: int, dto: UpdateEquipmentDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    e = equipment_service.update(db, equipment_id, dto, current_user)
    return ApiResponse(status=200, message="Equipment updated", data=EquipmentDTO.model_validate(e))


@router.delete("/{equipment_id}", response_model=ApiResponse[None])
def delete(equipment_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    equipment_service.delete(db, equipment_id, current_user)
    return ApiResponse(status=200, message="Equipment removed", data=None)
