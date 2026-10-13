from datetime import datetime
from sqlalchemy.orm import Session
from app.models import InsuranceClaim, Billing
from app.schemas import CreateInsuranceClaimDTO, UpdateInsuranceClaimDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


def get_all(db: Session, status: str = None, patient_id: int = None):
    q = db.query(InsuranceClaim)
    if status:
        q = q.filter(InsuranceClaim.status == status)
    if patient_id:
        q = q.filter(InsuranceClaim.patient_id == patient_id)
    return q.order_by(InsuranceClaim.submitted_at.desc()).all()


def get_by_id(db: Session, claim_id: int) -> InsuranceClaim:
    claim = db.query(InsuranceClaim).filter(InsuranceClaim.claim_id == claim_id).first()
    if not claim:
        raise NotFoundError("Insurance claim not found")
    return claim


def create(db: Session, dto: CreateInsuranceClaimDTO, current_user=None) -> InsuranceClaim:
    bill = db.query(Billing).filter(Billing.billing_id == dto.billing_id).first()
    if not bill:
        raise NotFoundError("Bill not found")
    if dto.claim_amount <= 0:
        raise BusinessError("Claim amount must be greater than zero")

    claim = InsuranceClaim(**dto.model_dump(), status="SUBMITTED")
    db.add(claim)
    db.commit()
    db.refresh(claim)
    log_action(db, current_user, "CREATE", "InsuranceClaim", claim.claim_id,
               f"Filed claim with {dto.insurance_provider}")
    return claim


def update_status(db: Session, claim_id: int, dto: UpdateInsuranceClaimDTO, current_user=None) -> InsuranceClaim:
    claim = get_by_id(db, claim_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(claim, field, value)
    if dto.status in ("APPROVED", "REJECTED") and claim.resolved_at is None:
        claim.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(claim)
    log_action(db, current_user, "UPDATE", "InsuranceClaim", claim_id, f"Status -> {dto.status}")
    return claim
