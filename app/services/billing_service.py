from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Billing, Patient, BillItem, InsuranceClaim
from app.schemas import BillingDTO, CreateBillingDTO, UpdateBillingDTO, BillItemDTO, CreateBillItemDTO, CreateBillWithItemsDTO
from sqlalchemy import func
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action


VALID_STATUSES = {"PENDING", "PARTIALLY_PAID", "PAID", "CANCELLED", "REFUNDED"}
VALID_PAYMENT_METHODS = {"CASH", "UPI", "GPAY", "CARD", "ONLINE", "CHEQUE", "OTHER"}


def _to_dto(bill: Billing) -> BillingDTO:
    return BillingDTO(
        billing_id=bill.billing_id,
        patient_id=bill.patient_id,
        patient_name=bill.patient.name if bill.patient else "",
        appointment_id=bill.appointment_id,
        amount=bill.amount,
        description=bill.description,
        status=bill.status,
        payment_method=bill.payment_method,
        payment_date=bill.payment_date,
        created_at=bill.created_at,
        updated_at=bill.updated_at,
    )


def get_all_bills(db: Session, status: str = None, patient_id: int = None):
    q = db.query(Billing)
    if status:
        q = q.filter(Billing.status == status)
    if patient_id:
        q = q.filter(Billing.patient_id == patient_id)
    return [_to_dto(b) for b in q.order_by(Billing.created_at.desc()).all()]


def get_bill_by_id(db: Session, billing_id: int) -> Billing:
    bill = db.query(Billing).filter(Billing.billing_id == billing_id).first()
    if not bill:
        raise NotFoundError("Bill not found")
    return bill


def create_bill(db: Session, dto: CreateBillingDTO, current_user=None) -> BillingDTO:
    patient = db.query(Patient).filter(Patient.patient_id == dto.patient_id).first()
    if not patient:
        raise NotFoundError("Patient not found")
    if dto.amount <= 0:
        raise BusinessError("Amount must be greater than zero")

    bill = Billing(
        patient_id=dto.patient_id,
        appointment_id=dto.appointment_id,
        amount=dto.amount,
        description=dto.description,
        status="PENDING",
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    log_action(db, current_user, "CREATE", "Billing", bill.billing_id, f"Created bill for patient {patient.name}")
    return _to_dto(bill)


def update_bill(db: Session, billing_id: int, dto: UpdateBillingDTO, current_user=None) -> BillingDTO:
    bill = get_bill_by_id(db, billing_id)
    if dto.status is not None and dto.status not in VALID_STATUSES:
        raise BusinessError(f"Invalid status. Must be one of: {', '.join(sorted(VALID_STATUSES))}")
    if dto.payment_method is not None and dto.payment_method not in VALID_PAYMENT_METHODS:
        raise BusinessError(f"Invalid payment method. Must be one of: {', '.join(sorted(VALID_PAYMENT_METHODS))}")

    for field in ("amount", "description", "status", "payment_method"):
        value = getattr(dto, field)
        if value is not None:
            setattr(bill, field, value)
    if dto.status == "PAID" and bill.payment_date is None:
        bill.payment_date = datetime.utcnow()
    db.commit()
    db.refresh(bill)
    log_action(db, current_user, "UPDATE", "Billing", billing_id)
    return _to_dto(bill)


def mark_paid(db: Session, billing_id: int, payment_method: str, current_user=None) -> BillingDTO:
    bill = get_bill_by_id(db, billing_id)
    if bill.status == "PAID":
        raise BusinessError("Bill is already marked as paid")
    if payment_method not in VALID_PAYMENT_METHODS:
        raise BusinessError(f"Invalid payment method. Must be one of: {', '.join(sorted(VALID_PAYMENT_METHODS))}")
    bill.status = "PAID"
    bill.payment_method = payment_method
    bill.payment_date = datetime.utcnow()
    db.commit()
    db.refresh(bill)
    log_action(db, current_user, "UPDATE", "Billing", billing_id, f"Marked as paid via {payment_method}")
    return _to_dto(bill)


def delete_bill(db: Session, billing_id: int, current_user=None) -> None:
    bill = db.query(Billing).filter(Billing.billing_id == billing_id).first()
    if not bill:
        raise NotFoundError("Bill not found")
    claims = db.query(InsuranceClaim).filter(InsuranceClaim.billing_id == billing_id).count()
    if claims:
        raise BusinessError(f"Cannot delete bill #{billing_id}: {claims} insurance claim(s) use it.")
    db.delete(bill)
    db.commit()
    log_action(db, current_user, "DELETE", "Billing", billing_id)


def get_patient_bills(db: Session, patient_id: int):
    rows = db.query(Billing).filter(Billing.patient_id == patient_id).order_by(Billing.created_at.desc()).all()
    return [_to_dto(b) for b in rows]


def get_total_revenue(db: Session) -> float:
    from sqlalchemy import func
    total = db.query(func.coalesce(func.sum(Billing.amount), 0)).filter(Billing.status == "PAID").scalar()
    return float(total or 0)


def get_pending_amount(db: Session) -> float:
    from sqlalchemy import func
    total = db.query(func.coalesce(func.sum(Billing.amount), 0)).filter(Billing.status == "PENDING").scalar()
    return float(total or 0)


# ---------- Itemised charges ----------
BILL_ITEM_CATEGORIES = {"CONSULTATION", "WARD_BED", "MEDICINE", "LAB", "RADIOLOGY", "OT_PROCEDURE", "OTHER"}
LOCKED_BILL_STATUSES = {"PAID", "CANCELLED", "REFUNDED"}


def _item_dto(item: BillItem) -> BillItemDTO:
    return BillItemDTO(
        item_id=item.item_id, billing_id=item.billing_id, category=item.category,
        description=item.description, quantity=item.quantity, unit_price=item.unit_price,
        amount=item.amount, created_at=item.created_at,
        service_date=item.service_date, end_date=item.end_date,
    )


def _recalculate_total(db: Session, bill: Billing) -> None:
    """The bill total is always the sum of its charges once any charge exists."""
    total = db.query(func.coalesce(func.sum(BillItem.amount), 0)).filter(
        BillItem.billing_id == bill.billing_id).scalar()
    bill.amount = total


def list_items(db: Session, billing_id: int):
    bill = get_bill_by_id(db, billing_id)
    rows = db.query(BillItem).filter(BillItem.billing_id == bill.billing_id).order_by(BillItem.created_at).all()
    return [_item_dto(i) for i in rows]


def add_item(db: Session, billing_id: int, dto: CreateBillItemDTO, current_user=None) -> BillItemDTO:
    bill = get_bill_by_id(db, billing_id)
    if bill.status in LOCKED_BILL_STATUSES:
        raise BusinessError(f"This bill is {bill.status.lower()} and can't be changed")
    if dto.category not in BILL_ITEM_CATEGORIES:
        raise BusinessError("Invalid charge category")
    if not dto.description.strip():
        raise BusinessError("Please enter a description for the charge")
    if dto.quantity < 1:
        raise BusinessError("Quantity must be at least 1")
    if dto.unit_price < 0:
        raise BusinessError("Price can't be negative")

    quantity = dto.quantity
    start, end = dto.service_date, dto.end_date
    if dto.category == "WARD_BED" and start and end:
        if end <= start:
            raise BusinessError("Discharge date must be after the admission date")
        import math
        quantity = max(1, math.ceil((end - start).total_seconds() / 86400))  # days stayed

    item = BillItem(
        billing_id=bill.billing_id, category=dto.category, description=dto.description.strip(),
        quantity=quantity, unit_price=dto.unit_price, amount=dto.unit_price * quantity,
        service_date=start, end_date=end,
    )
    db.add(item)
    db.flush()
    _recalculate_total(db, bill)
    db.commit()
    db.refresh(item)
    log_action(db, current_user, "CREATE", "BillItem", item.item_id,
               f"Added {dto.category} charge to bill #{bill.billing_id}: {item.description}")
    return _item_dto(item)


def delete_item(db: Session, item_id: int, current_user=None) -> None:
    item = db.query(BillItem).filter(BillItem.item_id == item_id).first()
    if not item:
        raise NotFoundError("Charge not found")
    bill = get_bill_by_id(db, item.billing_id)
    if bill.status in LOCKED_BILL_STATUSES:
        raise BusinessError(f"This bill is {bill.status.lower()} and can't be changed")
    db.delete(item)
    db.flush()
    _recalculate_total(db, bill)
    db.commit()
    log_action(db, current_user, "DELETE", "BillItem", item_id, f"Removed charge from bill #{bill.billing_id}")


def create_bill_with_items(db: Session, dto: CreateBillWithItemsDTO, current_user=None) -> BillingDTO:
    """Creates one bill with all its charges. Every charge is checked first, so a
    bad line never leaves a partial bill in the database."""
    import math
    patient = db.query(Patient).filter(Patient.patient_id == dto.patient_id).first()
    if not patient:
        raise NotFoundError("Patient not found")
    if not dto.lines:
        raise BusinessError("Add at least one charge to the bill")

    prepared = []
    for n, line in enumerate(dto.lines, 1):
        if line.category not in BILL_ITEM_CATEGORIES:
            raise BusinessError(f"Charge {n}: invalid charge type")
        if not line.description.strip():
            raise BusinessError(f"Charge {n}: enter a description")
        if line.unit_price < 0:
            raise BusinessError(f"Charge {n}: price can't be negative")
        quantity = line.quantity
        if line.category == "WARD_BED":
            if not line.service_date or not line.end_date:
                raise BusinessError(f"Charge {n}: enter the admission and discharge date and time")
            if line.end_date <= line.service_date:
                raise BusinessError(f"Charge {n}: discharge must be after admission")
            quantity = max(1, math.ceil((line.end_date - line.service_date).total_seconds() / 86400))
        if quantity < 1:
            raise BusinessError(f"Charge {n}: quantity must be at least 1")
        prepared.append((line, quantity))

    bill = Billing(patient_id=patient.patient_id, appointment_id=dto.appointment_id,
                   amount=0, description=dto.description.strip(), status="PENDING")
    db.add(bill)
    db.flush()
    for line, quantity in prepared:
        db.add(BillItem(
            billing_id=bill.billing_id, category=line.category, description=line.description.strip(),
            quantity=quantity, unit_price=line.unit_price, amount=line.unit_price * quantity,
            service_date=line.service_date, end_date=line.end_date,
        ))
    db.flush()
    _recalculate_total(db, bill)
    db.commit()
    db.refresh(bill)
    log_action(db, current_user, "CREATE", "Billing", bill.billing_id,
               f"Created bill for {patient.name} with {len(prepared)} charge(s)")
    return _to_dto(bill)

