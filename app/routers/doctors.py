from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, DoctorDTO, CreateDoctorDTO, UpdateDoctorDTO
from app.services import doctor_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


@router.get("", response_model=ApiResponse[List[DoctorDTO]])
def get_all_doctors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    doctors = doctor_service.get_all_doctors(db, skip, limit)
    data = [DoctorDTO.model_validate(d) for d in doctors]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/filter", response_model=ApiResponse[List[DoctorDTO]])
def filter_doctors(name: Optional[str] = None, specialization: Optional[str] = None,
                    status: Optional[str] = None, min_experience: Optional[int] = None,
                    db: Session = Depends(get_db)):
    doctors = doctor_service.search_doctors(db, name, specialization, status, min_experience)
    data = [DoctorDTO.model_validate(d) for d in doctors]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/available/all", response_model=ApiResponse[List[DoctorDTO]])
def get_available_doctors(db: Session = Depends(get_db)):
    doctors = doctor_service.get_available_doctors(db)
    data = [DoctorDTO.model_validate(d) for d in doctors]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{doctor_id}/available-slots", response_model=ApiResponse[List[str]])
def get_available_slots(doctor_id: int, day: date, slot_minutes: int = 30, db: Session = Depends(get_db)):
    from app.services.appointment_service import get_doctor_available_slots
    slots = get_doctor_available_slots(db, doctor_id, day, slot_minutes)
    return ApiResponse(status=200, message="Success", data=[s.isoformat() for s in slots])


@router.get("/{doctor_id}", response_model=ApiResponse[DoctorDTO])
def get_doctor_by_id(doctor_id: int, db: Session = Depends(get_db)):
    doctor = doctor_service.get_doctor_by_id(db, doctor_id)
    return ApiResponse(status=200, message="Success", data=DoctorDTO.model_validate(doctor))


@router.post("", response_model=ApiResponse[DoctorDTO], status_code=201)
def create_doctor(dto: CreateDoctorDTO, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user_optional)):
    doctor = doctor_service.create_doctor(db, dto, current_user)
    body = ApiResponse(status=201, message="Doctor created successfully", data=DoctorDTO.model_validate(doctor))
    return JSONResponse(status_code=201, content=body.model_dump(mode="json"))


@router.put("/{doctor_id}", response_model=ApiResponse[DoctorDTO])
def update_doctor(doctor_id: int, dto: UpdateDoctorDTO, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user_optional)):
    doctor = doctor_service.update_doctor(db, doctor_id, dto, current_user)
    return ApiResponse(status=200, message="Doctor updated successfully", data=DoctorDTO.model_validate(doctor))


@router.delete("/{doctor_id}", response_model=ApiResponse[None])
def delete_doctor(doctor_id: int, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user_optional)):
    doctor_service.delete_doctor(db, doctor_id, current_user)
    return ApiResponse(status=200, message="Doctor deleted successfully", data=None)


@router.get("/specialization/{specialization}", response_model=ApiResponse[List[DoctorDTO]])
def get_doctors_by_specialization(specialization: str, db: Session = Depends(get_db)):
    doctors = doctor_service.get_doctors_by_specialization(db, specialization)
    data = [DoctorDTO.model_validate(d) for d in doctors]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/search/{name}", response_model=ApiResponse[List[DoctorDTO]])
def search_doctors(name: str, db: Session = Depends(get_db)):
    doctors = doctor_service.search_doctors(db, name=name)
    data = [DoctorDTO.model_validate(d) for d in doctors]
    return ApiResponse(status=200, message="Success", data=data)
