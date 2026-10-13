import io
import csv
from openpyxl import Workbook


def bills_to_csv(bills: list) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Billing ID", "Patient", "Amount", "Status", "Description", "Created At"])
    for b in bills:
        writer.writerow([
            b.billing_id,
            b.patient.name if b.patient else "-",
            float(b.amount),
            b.status,
            b.description or "",
            b.created_at.strftime("%Y-%m-%d %H:%M"),
        ])
    return buffer.getvalue().encode("utf-8")


def appointments_to_excel(appointments: list) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Appointments"
    ws.append(["ID", "Patient", "Doctor", "Date/Time", "Duration (min)", "Status", "Reason"])
    for a in appointments:
        ws.append([
            a.appointment_id,
            a.patient.name if a.patient else "-",
            a.doctor.name if a.doctor else "-",
            a.appointment_date_time.strftime("%Y-%m-%d %H:%M"),
            a.duration_in_minutes,
            a.status,
            a.reason or "",
        ])
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.read()
