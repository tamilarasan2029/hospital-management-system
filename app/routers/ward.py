from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    ApiResponse, WardDTO, CreateWardDTO, BedDTO, CreateBedDTO, AdmitPatientDTO,
    OTBookingDTO, CreateOTBookingDTO, UpdateOTBookingDTO,
)
from app.services import ward_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/wards", tags=["ward-bed-ot"])


@router.get("", response_model=ApiResponse[List[WardDTO]])
def get_wards(db: Session = Depends(get_db)):
    data = [WardDTO.model_validate(w) for w in ward_service.get_all_wards(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.post("", response_model=ApiResponse[WardDTO], status_code=201)
def create_ward(dto: CreateWardDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    w = ward_service.create_ward(db, dto, current_user)
    return ApiResponse(status=201, message="Ward created", data=WardDTO.model_validate(w))


@router.get("/beds", response_model=ApiResponse[List[BedDTO]])
def get_beds(ward_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    data = [BedDTO.model_validate(b) for b in ward_service.get_all_beds(db, ward_id, status)]
    return ApiResponse(status=200, message="Success", data=data)


@router.post("/beds", response_model=ApiResponse[BedDTO], status_code=201)
def create_bed(dto: CreateBedDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    b = ward_service.create_bed(db, dto, current_user)
    return ApiResponse(status=201, message="Bed added", data=BedDTO.model_validate(b))


@router.put("/beds/{bed_id}/admit", response_model=ApiResponse[BedDTO])
def admit(bed_id: int, dto: AdmitPatientDTO, db: Session = Depends(get_db),
          current_user=Depends(get_current_user_optional)):
    b = ward_service.admit_patient(db, bed_id, dto.patient_id, current_user)
    return ApiResponse(status=200, message="Patient admitted", data=BedDTO.model_validate(b))


@router.put("/beds/{bed_id}/discharge", response_model=ApiResponse[BedDTO])
def discharge(bed_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    b = ward_service.discharge_patient(db, bed_id, current_user)
    return ApiResponse(status=200, message="Patient discharged", data=BedDTO.model_validate(b))


ot_router = APIRouter(prefix="/api/ot-bookings", tags=["ward-bed-ot"])


@ot_router.get("", response_model=ApiResponse[List[OTBookingDTO]])
def get_ot_bookings(db: Session = Depends(get_db)):
    data = ward_service.get_all_ot_bookings(db)
    return ApiResponse(status=200, message="Success", data=data)


@ot_router.post("", response_model=ApiResponse[OTBookingDTO], status_code=201)
def create_ot_booking(dto: CreateOTBookingDTO, db: Session = Depends(get_db),
                       current_user=Depends(get_current_user_optional)):
    booking = ward_service.create_ot_booking(db, dto, current_user)
    return ApiResponse(status=201, message="OT booked", data=booking)


@ot_router.put("/{booking_id}", response_model=ApiResponse[OTBookingDTO])
def update_ot_booking(booking_id: int, dto: UpdateOTBookingDTO, db: Session = Depends(get_db),
                       current_user=Depends(get_current_user_optional)):
    booking = ward_service.update_ot_booking(db, booking_id, dto, current_user)
    return ApiResponse(status=200, message="OT booking updated", data=booking)
