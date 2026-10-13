from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, PrescriptionDTO, CreatePrescriptionDTO
from app.services import prescription_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[PrescriptionDTO]])
def get_by_patient(patient_id: int, db: Session = Depends(get_db)):
    data = [PrescriptionDTO.model_validate(p) for p in prescription_service.get_by_patient(db, patient_id)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/appointment/{appointment_id}", response_model=ApiResponse[List[PrescriptionDTO]])
def get_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    data = [PrescriptionDTO.model_validate(p) for p in prescription_service.get_by_appointment(db, appointment_id)]
    return ApiResponse(status=200, message="Success", data=data)


@router.post("", response_model=ApiResponse[PrescriptionDTO], status_code=201)
def create(dto: CreatePrescriptionDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    p = prescription_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Prescription created", data=PrescriptionDTO.model_validate(p))


@router.delete("/{prescription_id}", response_model=ApiResponse[None])
def delete(prescription_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    prescription_service.delete(db, prescription_id, current_user)
    return ApiResponse(status=200, message="Prescription deleted", data=None)
