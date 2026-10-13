from datetime import datetime, timedelta
from sqlalchemy import text, func
from sqlalchemy.orm import Session
from app.models import Patient, Doctor, Appointment, Billing, Staff
from app.schemas import DashboardStatsDTO, RevenuePointDTO, AppointmentsPerDayDTO


def get_stats(db: Session) -> DashboardStatsDTO:
    """Uses the dashboard_stats VIEW already defined in the database where possible,
    falling back to direct counts for anything the view doesn't cover."""
    try:
        row = db.execute(text("SELECT * FROM dashboard_stats")).mappings().first()
    except Exception:
        row = None

    if row:
        total_patients = row["total_patients"]
        total_doctors = row["total_doctors"]
        total_appointments = row["total_appointments"]
        pending_appointments = row["pending_appointments"]
        completed_appointments = row["completed_appointments"]
    else:
        total_patients = db.query(func.count(Patient.patient_id)).scalar()
        total_doctors = db.query(func.count(Doctor.doctor_id)).scalar()
        total_appointments = db.query(func.count(Appointment.appointment_id)).scalar()
        pending_appointments = db.query(func.count(Appointment.appointment_id)).filter(
            Appointment.status == "SCHEDULED").scalar()
        completed_appointments = db.query(func.count(Appointment.appointment_id)).filter(
            Appointment.status == "COMPLETED").scalar()

    total_revenue = db.query(func.coalesce(func.sum(Billing.amount), 0)).filter(
        Billing.status == "PAID").scalar()
    pending_bills_amount = db.query(func.coalesce(func.sum(Billing.amount), 0)).filter(
        Billing.status == "PENDING").scalar()
    total_staff = db.query(func.count(Staff.staff_id)).scalar()

    return DashboardStatsDTO(
        total_patients=total_patients or 0,
        total_doctors=total_doctors or 0,
        total_appointments=total_appointments or 0,
        pending_appointments=pending_appointments or 0,
        completed_appointments=completed_appointments or 0,
        total_revenue=total_revenue or 0,
        pending_bills_amount=pending_bills_amount or 0,
        total_staff=total_staff or 0,
    )


def get_revenue_by_month(db: Session, months: int = 6) -> list:
    """Revenue grouped by calendar month for the last N months, for charting."""
    cutoff = datetime.utcnow() - timedelta(days=30 * months)
    rows = db.query(
        func.to_char(Billing.payment_date, 'YYYY-MM').label("period"),
        func.sum(Billing.amount).label("revenue"),
    ).filter(
        Billing.status == "PAID",
        Billing.payment_date.isnot(None),
        Billing.payment_date >= cutoff,
    ).group_by("period").order_by("period").all()

    return [RevenuePointDTO(period=r.period, revenue=r.revenue) for r in rows]


def get_appointments_per_day(db: Session, days: int = 14) -> list:
    cutoff = datetime.utcnow() - timedelta(days=days)
    rows = db.query(
        func.to_char(Appointment.appointment_date_time, 'YYYY-MM-DD').label("day"),
        func.count(Appointment.appointment_id).label("count"),
    ).filter(Appointment.appointment_date_time >= cutoff).group_by("day").order_by("day").all()

    return [AppointmentsPerDayDTO(date=r.day, count=r.count) for r in rows]
