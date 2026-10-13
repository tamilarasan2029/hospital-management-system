from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    ApiResponse, LinkPatientAccountDTO, PatientDTO, AppointmentDTO, BillingDTO,
    MedicalRecordDTO, PrescriptionDTO, LabOrderDTO,
)
from app.services import portal_service
from app.services.appointment_service import _to_dto as appointment_to_dto
from app.services.billing_service import _to_dto as billing_to_dto
from app.deps import get_current_user, require_roles
from app.models import User

router = APIRouter(prefix="/api/portal", tags=["patient-portal"])


@router.post("/link", response_model=ApiResponse[None])
def link_my_account(dto: LinkPatientAccountDTO, db: Session = Depends(get_db),
                     current_user: User = Depends(require_roles("PATIENT"))):
    portal_service.link_account(db, current_user, dto.patient_id)
    return ApiResponse(status=200, message="Account linked to your patient record", data=None)


@router.get("/me", response_model=ApiResponse[PatientDTO])
def my_profile(db: Session = Depends(get_db), current_user: User = Depends(require_roles("PATIENT"))):
    patient = portal_service.get_my_profile(db, current_user)
    return ApiResponse(status=200, message="Success", data=PatientDTO.model_validate(patient))


@router.get("/appointments", response_model=ApiResponse[List[AppointmentDTO]])
def my_appointments(db: Session = Depends(get_db), current_user: User = Depends(require_roles("PATIENT"))):
    rows = portal_service.get_my_appointments(db, current_user)
    return ApiResponse(status=200, message="Success", data=[appointment_to_dto(a) for a in rows])


@router.get("/bills", response_model=ApiResponse[List[BillingDTO]])
def my_bills(db: Session = Depends(get_db), current_user: User = Depends(require_roles("PATIENT"))):
    rows = portal_service.get_my_bills(db, current_user)
    return ApiResponse(status=200, message="Success", data=[billing_to_dto(b) for b in rows])


@router.get("/medical-records", response_model=ApiResponse[List[MedicalRecordDTO]])
def my_medical_records(db: Session = Depends(get_db), current_user: User = Depends(require_roles("PATIENT"))):
    rows = portal_service.get_my_medical_records(db, current_user)
    return ApiResponse(status=200, message="Success", data=[MedicalRecordDTO.model_validate(r) for r in rows])


@router.get("/prescriptions", response_model=ApiResponse[List[PrescriptionDTO]])
def my_prescriptions(db: Session = Depends(get_db), current_user: User = Depends(require_roles("PATIENT"))):
    rows = portal_service.get_my_prescriptions(db, current_user)
    return ApiResponse(status=200, message="Success", data=[PrescriptionDTO.model_validate(r) for r in rows])


@router.get("/lab-orders", response_model=ApiResponse[List[LabOrderDTO]])
def my_lab_orders(db: Session = Depends(get_db), current_user: User = Depends(require_roles("PATIENT"))):
    rows = portal_service.get_my_lab_orders(db, current_user)
    return ApiResponse(status=200, message="Success", data=[LabOrderDTO.model_validate(r) for r in rows])
