from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, InsuranceClaimDTO, CreateInsuranceClaimDTO, UpdateInsuranceClaimDTO
from app.services import insurance_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/insurance-claims", tags=["insurance"])


@router.get("", response_model=ApiResponse[List[InsuranceClaimDTO]])
def get_all(status: Optional[str] = None, patient_id: Optional[int] = None, db: Session = Depends(get_db)):
    data = [InsuranceClaimDTO.model_validate(c) for c in insurance_service.get_all(db, status, patient_id)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{claim_id}", response_model=ApiResponse[InsuranceClaimDTO])
def get_one(claim_id: int, db: Session = Depends(get_db)):
    c = insurance_service.get_by_id(db, claim_id)
    return ApiResponse(status=200, message="Success", data=InsuranceClaimDTO.model_validate(c))


@router.post("", response_model=ApiResponse[InsuranceClaimDTO], status_code=201)
def create(dto: CreateInsuranceClaimDTO, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    c = insurance_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Claim filed", data=InsuranceClaimDTO.model_validate(c))


@router.put("/{claim_id}", response_model=ApiResponse[InsuranceClaimDTO])
def update_status(claim_id: int, dto: UpdateInsuranceClaimDTO, db: Session = Depends(get_db),
                   current_user=Depends(get_current_user_optional)):
    c = insurance_service.update_status(db, claim_id, dto, current_user)
    return ApiResponse(status=200, message="Claim updated", data=InsuranceClaimDTO.model_validate(c))
