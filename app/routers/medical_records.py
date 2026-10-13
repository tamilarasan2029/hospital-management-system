from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, MedicalRecordDTO, CreateMedicalRecordDTO, UpdateMedicalRecordDTO
from app.services import medical_record_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/medical-records", tags=["medical-records"])


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[MedicalRecordDTO]])
def get_by_patient(patient_id: int, db: Session = Depends(get_db)):
    data = [MedicalRecordDTO.model_validate(r) for r in medical_record_service.get_by_patient(db, patient_id)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{record_id}", response_model=ApiResponse[MedicalRecordDTO])
def get_one(record_id: int, db: Session = Depends(get_db)):
    r = medical_record_service.get_by_id(db, record_id)
    return ApiResponse(status=200, message="Success", data=MedicalRecordDTO.model_validate(r))


@router.post("", response_model=ApiResponse[MedicalRecordDTO], status_code=201)
def create(dto: CreateMedicalRecordDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    r = medical_record_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Medical record created", data=MedicalRecordDTO.model_validate(r))


@router.put("/{record_id}", response_model=ApiResponse[MedicalRecordDTO])
def update(record_id: int, dto: UpdateMedicalRecordDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    r = medical_record_service.update(db, record_id, dto, current_user)
    return ApiResponse(status=200, message="Medical record updated", data=MedicalRecordDTO.model_validate(r))


@router.delete("/{record_id}", response_model=ApiResponse[None])
def delete(record_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    medical_record_service.delete(db, record_id, current_user)
    return ApiResponse(status=200, message="Medical record deleted", data=None)
