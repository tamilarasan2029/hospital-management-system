from sqlalchemy.orm import Session, joinedload
from app.models import Patient, Appointment, Billing
from app.utils.pdf import generate_patient_list_pdf, generate_appointments_pdf, generate_bill_pdf
from app.utils.exports import bills_to_csv, appointments_to_excel
from app.exceptions import NotFoundError


def patients_pdf(db: Session) -> bytes:
    patients = db.query(Patient).all()
    return generate_patient_list_pdf(patients)


def appointments_pdf(db: Session) -> bytes:
    appts = db.query(Appointment).options(joinedload(Appointment.patient), joinedload(Appointment.doctor)).all()
    return generate_appointments_pdf(appts)


def appointments_excel(db: Session) -> bytes:
    appts = db.query(Appointment).options(joinedload(Appointment.patient), joinedload(Appointment.doctor)).all()
    return appointments_to_excel(appts)


def bills_csv(db: Session) -> bytes:
    bills = db.query(Billing).options(joinedload(Billing.patient)).all()
    return bills_to_csv(bills)


def single_bill_pdf(db: Session, billing_id: int) -> bytes:
    bill = db.query(Billing).options(joinedload(Billing.patient)).filter(
        Billing.billing_id == billing_id
    ).first()
    if not bill:
        raise NotFoundError("Bill not found")
    return generate_bill_pdf(bill, bill.patient)
