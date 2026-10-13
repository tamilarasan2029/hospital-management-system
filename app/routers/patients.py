from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, PatientDTO, CreatePatientDTO, UpdatePatientDTO
from app.services import patient_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=ApiResponse[List[PatientDTO]])
def get_all_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = patient_service.get_all_patients(db, skip, limit)
    data = [PatientDTO.model_validate(p) for p in patients]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/filter", response_model=ApiResponse[List[PatientDTO]])
def filter_patients(name: Optional[str] = None, blood_type: Optional[str] = None,
                     gender: Optional[str] = None, db: Session = Depends(get_db)):
    patients = patient_service.search_patients(db, name=name, blood_type=blood_type, gender=gender)
    data = [PatientDTO.model_validate(p) for p in patients]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{patient_id}", response_model=ApiResponse[PatientDTO])
def get_patient_by_id(patient_id: int, db: Session = Depends(get_db)):
    patient = patient_service.get_patient_by_id(db, patient_id)
    return ApiResponse(status=200, message="Success", data=PatientDTO.model_validate(patient))


@router.post("", response_model=ApiResponse[PatientDTO], status_code=201)
def create_patient(dto: CreatePatientDTO, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user_optional)):
    patient = patient_service.create_patient(db, dto, current_user)
    body = ApiResponse(status=201, message="Patient created successfully", data=PatientDTO.model_validate(patient))
    return JSONResponse(status_code=201, content=body.model_dump(mode="json"))


@router.put("/{patient_id}", response_model=ApiResponse[PatientDTO])
def update_patient(patient_id: int, dto: UpdatePatientDTO, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user_optional)):
    patient = patient_service.update_patient(db, patient_id, dto, current_user)
    return ApiResponse(status=200, message="Patient updated successfully", data=PatientDTO.model_validate(patient))


@router.delete("/{patient_id}", response_model=ApiResponse[None])
def delete_patient(patient_id: int, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user_optional)):
    patient_service.delete_patient(db, patient_id, current_user)
    return ApiResponse(status=200, message="Patient deleted successfully", data=None)


@router.get("/search/{name}", response_model=ApiResponse[List[PatientDTO]])
def search_patients(name: str, db: Session = Depends(get_db)):
    patients = patient_service.search_patients(db, name=name)
    data = [PatientDTO.model_validate(p) for p in patients]
    return ApiResponse(status=200, message="Success", data=data)
