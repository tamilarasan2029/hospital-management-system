from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, LabOrderDTO, CreateLabOrderDTO, UpdateLabResultDTO
from app.services import lab_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/lab-orders", tags=["lab-radiology"])


@router.post("", response_model=ApiResponse[LabOrderDTO], status_code=201)
def create_order(dto: CreateLabOrderDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    order = lab_service.create_order(db, dto, current_user)
    return ApiResponse(status=201, message="Order created", data=LabOrderDTO.model_validate(order))


@router.get("/{order_id}", response_model=ApiResponse[LabOrderDTO])
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = lab_service.get_by_id(db, order_id)
    return ApiResponse(status=200, message="Success", data=LabOrderDTO.model_validate(order))


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[LabOrderDTO]])
def get_by_patient(patient_id: int, db: Session = Depends(get_db)):
    data = [LabOrderDTO.model_validate(o) for o in lab_service.get_by_patient(db, patient_id)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/doctor/{doctor_id}", response_model=ApiResponse[List[LabOrderDTO]])
def get_by_doctor(doctor_id: int, status: Optional[str] = None, db: Session = Depends(get_db)):
    data = [LabOrderDTO.model_validate(o) for o in lab_service.get_by_doctor(db, doctor_id, status)]
    return ApiResponse(status=200, message="Success", data=data)


@router.put("/{order_id}/result", response_model=ApiResponse[LabOrderDTO])
def update_result(order_id: int, dto: UpdateLabResultDTO, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user_optional)):
    order = lab_service.update_result(db, order_id, dto, current_user)
    return ApiResponse(status=200, message="Result updated - ordering doctor notified", data=LabOrderDTO.model_validate(order))


@router.delete("/{order_id}", response_model=ApiResponse[None])
def delete_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    lab_service.delete_order(db, order_id, current_user)
    return ApiResponse(status=200, message="Order deleted", data=None)
