from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models import Appointment, Billing
from app.utils.notifications import create_notification

scheduler = BackgroundScheduler()


def auto_complete_past_appointments():
    """Any SCHEDULED appointment whose time + duration has passed gets marked COMPLETED."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        appts = db.query(Appointment).filter(Appointment.status == "SCHEDULED").all()
        changed = 0
        for a in appts:
            end_time = a.appointment_date_time + timedelta(minutes=a.duration_in_minutes or 30)
            if end_time < now:
                a.status = "COMPLETED"
                changed += 1
        if changed:
            db.commit()
    finally:
        db.close()


def flag_overdue_bills():
    """Bills PENDING for more than 30 days get a notification raised (once)."""
    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(days=30)
        overdue = db.query(Billing).filter(Billing.status == "PENDING", Billing.created_at < cutoff).all()
        for b in overdue:
            create_notification(
                db,
                type_="OVERDUE_BILL",
                title="Overdue bill",
                message=f"Bill #{b.billing_id} for patient #{b.patient_id} has been pending for over 30 days.",
                reference_type="Billing",
                reference_id=b.billing_id,
            )
    finally:
        db.close()


def upcoming_appointment_reminders():
    """Create a reminder notification for appointments happening in the next 24 hours."""
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        soon = now + timedelta(hours=24)
        upcoming = db.query(Appointment).filter(
            Appointment.status == "SCHEDULED",
            Appointment.appointment_date_time >= now,
            Appointment.appointment_date_time <= soon,
        ).all()
        for a in upcoming:
            create_notification(
                db,
                type_="APPOINTMENT_REMINDER",
                title="Upcoming appointment",
                message=f"Appointment #{a.appointment_id} is scheduled within 24 hours.",
                reference_type="Appointment",
                reference_id=a.appointment_id,
            )
    finally:
        db.close()


def start_scheduler():
    # Runs every hour; safe to call once at app startup.
    scheduler.add_job(auto_complete_past_appointments, "interval", hours=1, id="auto_complete", replace_existing=True)
    scheduler.add_job(flag_overdue_bills, "interval", hours=24, id="overdue_bills", replace_existing=True)
    scheduler.add_job(upcoming_appointment_reminders, "interval", hours=6, id="appt_reminders", replace_existing=True)
    scheduler.start()
