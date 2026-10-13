from sqlalchemy.orm import Session
from app.models import Medication, PharmacyDispense, Prescription
from app.schemas import CreateMedicationDTO, UpdateMedicationDTO, DispenseMedicationDTO, DispenseResultDTO
from app.exceptions import NotFoundError, BusinessError
from app.utils.audit import log_action
from app.utils.notifications import create_notification


def get_all(db: Session):
    return db.query(Medication).all()


def get_by_id(db: Session, medication_id: int) -> Medication:
    med = db.query(Medication).filter(Medication.medication_id == medication_id).first()
    if not med:
        raise NotFoundError("Medication not found")
    return med


def create(db: Session, dto: CreateMedicationDTO, current_user=None) -> Medication:
    if db.query(Medication).filter(Medication.name == dto.name).first():
        raise BusinessError("A medication with this name already exists")
    med = Medication(**dto.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    log_action(db, current_user, "CREATE", "Medication", med.medication_id, med.name)
    return med


def update(db: Session, medication_id: int, dto: UpdateMedicationDTO, current_user=None) -> Medication:
    med = get_by_id(db, medication_id)
    for field, value in dto.model_dump(exclude_unset=True).items():
        setattr(med, field, value)
    db.commit()
    db.refresh(med)

    if med.stock_quantity <= med.reorder_level:
        create_notification(
            db, "LOW_STOCK", "Low medication stock",
            f"{med.name} is at {med.stock_quantity} units (reorder level: {med.reorder_level}).",
            reference_type="Medication", reference_id=med.medication_id,
        )

    log_action(db, current_user, "UPDATE", "Medication", medication_id)
    return med


def delete(db: Session, medication_id: int, current_user=None) -> None:
    med = get_by_id(db, medication_id)
    db.delete(med)
    db.commit()
    log_action(db, current_user, "DELETE", "Medication", medication_id)


def get_low_stock(db: Session):
    return db.query(Medication).filter(Medication.stock_quantity <= Medication.reorder_level).all()


def _check_interaction(db: Session, patient_id: int, new_med: Medication) -> str:
    """Looks at what this patient has been dispensed before and flags a
    warning if any of it appears on the new medication's interaction list
    (or vice versa). This is a simple name-matching check, not a clinical
    substitute for a pharmacist's judgment."""
    if not new_med.interacts_with:
        return None

    conflict_names = {n.strip().lower() for n in new_med.interacts_with.split(",") if n.strip()}
    if not conflict_names:
        return None

    past_dispenses = db.query(PharmacyDispense).filter(PharmacyDispense.patient_id == patient_id).all()
    past_med_names = {d.medication.name.lower() for d in past_dispenses if d.medication}

    matches = conflict_names & past_med_names
    if matches:
        return f"Potential interaction: {new_med.name} conflicts with previously dispensed: {', '.join(matches)}"
    return None


def dispense(db: Session, dto: DispenseMedicationDTO, current_user=None) -> DispenseResultDTO:
    med = get_by_id(db, dto.medication_id)

    if dto.quantity <= 0:
        raise BusinessError("Quantity must be greater than zero")
    if med.stock_quantity < dto.quantity:
        raise BusinessError(f"Insufficient stock: only {med.stock_quantity} units of {med.name} available")

    if dto.prescription_id is not None:
        if not db.query(Prescription).filter(Prescription.prescription_id == dto.prescription_id).first():
            raise NotFoundError("Prescription not found")

    warning = _check_interaction(db, dto.patient_id, med)

    med.stock_quantity -= dto.quantity
    dispense_record = PharmacyDispense(
        prescription_id=dto.prescription_id,
        patient_id=dto.patient_id,
        medication_id=dto.medication_id,
        quantity=dto.quantity,
        dispensed_by_user_id=getattr(current_user, "user_id", None),
    )
    db.add(dispense_record)
    db.commit()
    db.refresh(dispense_record)
    db.refresh(med)

    if med.stock_quantity <= med.reorder_level:
        create_notification(
            db, "LOW_STOCK", "Low medication stock",
            f"{med.name} is at {med.stock_quantity} units (reorder level: {med.reorder_level}).",
            reference_type="Medication", reference_id=med.medication_id,
        )

    log_action(db, current_user, "CREATE", "PharmacyDispense", dispense_record.dispense_id,
               f"Dispensed {dto.quantity}x {med.name}" + (f" - {warning}" if warning else ""))

    return DispenseResultDTO(
        dispense_id=dispense_record.dispense_id,
        medication_name=med.name,
        quantity=dto.quantity,
        remaining_stock=med.stock_quantity,
        interaction_warning=warning,
    )
