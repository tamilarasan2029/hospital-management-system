from typing import List
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, AppointmentDTO, CreateAppointmentDTO, UpdateAppointmentDTO
from app.services import appointment_service
from app.deps import get_current_user_optional
from app.schemas import PublicBookDTO

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("", response_model=ApiResponse[List[AppointmentDTO]])
def get_all_appointments(db: Session = Depends(get_db)):
    data = appointment_service.get_all_appointments(db)
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{appointment_id}", response_model=ApiResponse[AppointmentDTO])
def get_appointment_by_id(appointment_id: int, db: Session = Depends(get_db)):
    data = appointment_service.get_appointment_by_id(db, appointment_id)
    return ApiResponse(status=200, message="Success", data=data)


@router.post("", response_model=ApiResponse[AppointmentDTO], status_code=201)
def create_appointment(dto: CreateAppointmentDTO, db: Session = Depends(get_db),
                        current_user=Depends(get_current_user_optional)):
    data = appointment_service.create_appointment(db, dto, current_user)
    body = ApiResponse(status=201, message="Appointment booked successfully", data=data)
    return JSONResponse(status_code=201, content=body.model_dump(mode="json"))


@router.put("/{appointment_id}", response_model=ApiResponse[AppointmentDTO])
def update_appointment(appointment_id: int, dto: UpdateAppointmentDTO, db: Session = Depends(get_db),
                        current_user=Depends(get_current_user_optional)):
    data = appointment_service.update_appointment(db, appointment_id, dto, current_user)
    return ApiResponse(status=200, message="Appointment updated successfully", data=data)


@router.delete("/{appointment_id}", response_model=ApiResponse[None])
def delete_appointment(appointment_id: int, db: Session = Depends(get_db),
                        current_user=Depends(get_current_user_optional)):
    appointment_service.delete_appointment(db, appointment_id, current_user)
    return ApiResponse(status=200, message="Appointment cancelled successfully", data=None)


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[AppointmentDTO]])
def get_patient_appointments(patient_id: int, db: Session = Depends(get_db)):
    data = appointment_service.get_patient_appointments(db, patient_id)
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/doctor/{doctor_id}", response_model=ApiResponse[List[AppointmentDTO]])
def get_doctor_appointments(doctor_id: int, db: Session = Depends(get_db)):
    data = appointment_service.get_doctor_appointments(db, doctor_id)
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/status/{status}", response_model=ApiResponse[List[AppointmentDTO]])
def get_appointments_by_status(status: str, db: Session = Depends(get_db)):
    data = appointment_service.get_appointments_by_status(db, status)
    return ApiResponse(status=200, message="Success", data=data)

@router.post("/public", response_model=ApiResponse[AppointmentDTO], status_code=201)
def public_book_appointment(dto: PublicBookDTO, db: Session = Depends(get_db)):
    data = appointment_service.public_book(db, dto)
    body = ApiResponse(status=201, message="Appointment booked successfully", data=data)
    return JSONResponse(status_code=201, content=body.model_dump(mode="json"))
