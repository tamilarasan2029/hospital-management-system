from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, MedicationDTO, CreateMedicationDTO, UpdateMedicationDTO, DispenseMedicationDTO, DispenseResultDTO
from app.services import pharmacy_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/pharmacy", tags=["pharmacy"])


@router.get("/medications", response_model=ApiResponse[List[MedicationDTO]])
def get_all(db: Session = Depends(get_db)):
    data = [MedicationDTO.model_validate(m) for m in pharmacy_service.get_all(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/medications/low-stock", response_model=ApiResponse[List[MedicationDTO]])
def low_stock(db: Session = Depends(get_db)):
    data = [MedicationDTO.model_validate(m) for m in pharmacy_service.get_low_stock(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/medications/{medication_id}", response_model=ApiResponse[MedicationDTO])
def get_one(medication_id: int, db: Session = Depends(get_db)):
    m = pharmacy_service.get_by_id(db, medication_id)
    return ApiResponse(status=200, message="Success", data=MedicationDTO.model_validate(m))


@router.post("/medications", response_model=ApiResponse[MedicationDTO], status_code=201)
def create(dto: CreateMedicationDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    m = pharmacy_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Medication added", data=MedicationDTO.model_validate(m))


@router.put("/medications/{medication_id}", response_model=ApiResponse[MedicationDTO])
def update(medication_id: int, dto: UpdateMedicationDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    m = pharmacy_service.update(db, medication_id, dto, current_user)
    return ApiResponse(status=200, message="Medication updated", data=MedicationDTO.model_validate(m))


@router.delete("/medications/{medication_id}", response_model=ApiResponse[None])
def delete(medication_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    pharmacy_service.delete(db, medication_id, current_user)
    return ApiResponse(status=200, message="Medication removed", data=None)


@router.post("/dispense", response_model=ApiResponse[DispenseResultDTO], status_code=201)
def dispense(dto: DispenseMedicationDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    result = pharmacy_service.dispense(db, dto, current_user)
    message = "Dispensed successfully"
    if result.interaction_warning:
        message = f"Dispensed with warning: {result.interaction_warning}"
    return ApiResponse(status=201, message=message, data=result)
