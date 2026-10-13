import io
from types import SimpleNamespace
from datetime import date
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import HOSPITAL_NAME, HOSPITAL_ADDRESS, HOSPITAL_PHONE, HOSPITAL_TIMING
from types import SimpleNamespace
from xml.sax.saxutils import escape as _esc

# Billing codes used on the printed bill, grouped the way hospital bills are.
GROUPS = [
    ("WARD_BED", "100000", "Room & Nursing Charges"),
    ("MEDICINE", "400000", "Medicine & Consumables"),
    ("CONSULTATION", "500000", "Professional Fees"),
    ("LAB", "600000", "Investigation Charges"),
    ("RADIOLOGY", "600000", "Investigation Charges"),
    ("OT_PROCEDURE", "800000", "Procedure Charges"),
    ("OTHER", "900000", "Miscellaneous Charges"),
]
GROUP_OF = {cat: (code, title) for cat, code, title in GROUPS}
CATEGORY_LABEL = {
    "WARD_BED": "Bed Charges", "MEDICINE": "Medicine", "CONSULTATION": "Consultation",
    "LAB": "Lab Test", "RADIOLOGY": "Radiology", "OT_PROCEDURE": "Procedure", "OTHER": "Other",
}

def _s(v) -> str:
    """Escape text before it goes into a PDF paragraph."""
    return _esc(str(v))

def _money(v) -> str:
    return f"{float(v):,.2f}"


def _dt(v) -> str:
    return v.strftime("%d-%m-%y %I:%M %p") if v else "-"


def _age(dob):
    if not dob:
        return None
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def _grid(rows, widths, right=()):
    t = Table(rows, colWidths=widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e8f3fb")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]
    for c in right:
        style.append(("ALIGN", (c, 1), (c, -1), "RIGHT"))
    t.setStyle(TableStyle(style))
    return t


def generate_bill_pdf(bill, patient) -> bytes:
    """Hospital-style invoice: header, patient and payer details, bill summary by
    group, detailed breakup with days for room charges, totals and payment summary."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm,
                            topMargin=14 * mm, bottomMargin=14 * mm, title=f"Bill {bill.billing_id}")
    st = getSampleStyleSheet()
    small = ParagraphStyle("small", parent=st["Normal"], fontSize=8.5, leading=11)
    bold = ParagraphStyle("bold", parent=small, fontName="Helvetica-Bold")
    head = ParagraphStyle("head", parent=st["Title"], fontSize=17, alignment=0, spaceAfter=0, leading=20)
    section = ParagraphStyle("section", parent=bold, fontSize=10, alignment=1, spaceBefore=10, spaceAfter=4)
    cell = ParagraphStyle("cell", parent=small)

    items = sorted(list(bill.items or []), key=lambda i: (i.service_date or i.created_at))
    if not items and float(bill.amount or 0) > 0:
        # Older bills were created with one amount and no charge lines. Show that
        # amount as a proper line, so the summary and breakup are never blank.
        items = [SimpleNamespace(category="OTHER", description=bill.description or "Medical services",
                                 quantity=1, unit_price=bill.amount, amount=bill.amount,
                                 service_date=None, end_date=None, created_at=bill.created_at)]
    ward = [i for i in items if i.category == "WARD_BED"]
    admit = min((i.service_date for i in ward if i.service_date), default=None)
    discharge = max((i.end_date for i in ward if i.end_date), default=None)
    days = sum(i.quantity for i in ward)
    bed = ward[0].description if ward else "-"
    appt = bill.appointment
    doctor = f"Dr. {appt.doctor.name} ({appt.doctor.specialization})" if appt and appt.doctor else "-"
    paid = bill.status == "PAID"
    total = float(bill.amount)
    amount_paid = total if paid else 0.0
    age = _age(patient.date_of_birth)

    el = [
        Paragraph(HOSPITAL_NAME, head),
        Paragraph(HOSPITAL_ADDRESS, small),
        Paragraph(f"Ph: {HOSPITAL_PHONE}  |  Timing: {HOSPITAL_TIMING}", small),
        Spacer(1, 8),
    ]

    left = [
        Paragraph("<b>Patient Details</b>", bold),
        Paragraph(f"{_s(patient.name)} ({_s(patient.gender or '-')}{', ' + str(age) + ' yrs' if age is not None else ''})", small),
        Paragraph(f"Blood group: {_s(patient.blood_type or '-')}", small),
        Paragraph(f"Phone: {_s(patient.phone or '-')}", small),
        Paragraph(f"Email: {_s(patient.email or '-')}", small),
        Spacer(1, 6),
        Paragraph("<b>Payer Details</b>", bold),
        Paragraph(f"Name: {_s(patient.name)}", small),
        Spacer(1, 6),
        Paragraph(f"<b>Consulting Doctor:</b> 	{_s(doctor)}", small),
    ]
    right = [
        Paragraph(f"<b>Patient UID:</b> {patient.patient_id}", small),
        Paragraph(f"<b>Bill No:</b> {bill.billing_id}", small),
        Paragraph(f"<b>Bill Date:</b> {_dt(bill.created_at)}", small),
        Paragraph(f"<b>Admission:</b> {_dt(admit)}", small),
        Paragraph(f"<b>Discharge:</b> {_dt(discharge)}", small),
        Paragraph(f"<b>Days stayed:</b> {days or '-'}", small),
        Paragraph(f"<b>Bed:</b> {_s(bed)}", small),
    ]
    header_block = Table([[left, right]], colWidths=[95 * mm, 85 * mm])
    header_block.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    el.append(header_block)

    # BILL SUMMARY by group
    el.append(Paragraph("BILL SUMMARY", section))
    totals, order = {}, []
    for _, code, title in GROUPS:
        if title not in totals:
            totals[title] = [code, 0.0]
            order.append(title)
    for it in items:
        code, title = GROUP_OF.get(it.category, ("900000", "Miscellaneous Charges"))
        totals[title][1] += float(it.amount)
    rows = [["Sr.No.", "Primary Code", "Particulars", "Amount"]]
    n = 0
    for title in order:
        code, amount = totals[title]
        if amount > 0:
            n += 1
            rows.append([str(n), code, title, _money(amount)])
    if len(rows) == 1:
        rows.append(["-", "-", "No charges", "0.00"])
    el.append(_grid(rows, [16 * mm, 30 * mm, 100 * mm, 34 * mm], right=[3]))

    tot_rows = [["Total Bill Amount", _money(total)], ["Amount Payable", _money(total)], ["Amount Paid", _money(amount_paid)]]
    tot = Table(tot_rows, colWidths=[46 * mm, 34 * mm], hAlign="RIGHT")
    tot.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "RIGHT"), ("FONTSIZE", (0, 0), (-1, -1), 9),
                             ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold")]))
    el.append(Spacer(1, 6))
    el.append(tot)

    # DETAILED BREAKUP
    el.append(Paragraph("DETAILED BREAKUP", section))
    if items:
        rows = [["No.", "Code", "Date & Time", "Particulars", "Rate", "Units", "Amount"]]
        for idx, it in enumerate(items, 1):
            code = GROUP_OF.get(it.category, ("900000", ""))[0]
            particulars = f"{CATEGORY_LABEL.get(it.category, 'Other')}: {it.description}"
            rows.append([str(idx), code, _dt(it.service_date or it.created_at), Paragraph(_s(particulars), cell),
                         _money(it.unit_price), str(it.quantity), _money(it.amount)])
        el.append(_grid(rows, [10 * mm, 16 * mm, 30 * mm, 62 * mm, 18 * mm, 14 * mm, 22 * mm], right=[4, 5, 6]))
        el.append(Paragraph("Room charges: Units are days. Rate is the charge per day.", small))
    else:
        el.append(Paragraph("No charges on this bill yet.", small))
    el.append(Spacer(1, 6))
    el.append(Paragraph(f"<b>Net Amount: Rs. {_money(total)}</b>", ParagraphStyle("net", parent=small, alignment=2)))

    # PAYMENT SUMMARY
    el.append(Paragraph("PAYMENT SUMMARY", section))
    if paid:
        pay_rows = [["Receipt No.", "Date & Time", "Amount", "Status", "Method"],
                    [f"RCPT-{bill.billing_id}", _dt(bill.payment_date), f"Rs. {_money(total)}", "PAID", bill.payment_method or "-"]]
    else:
        pay_rows = [["Receipt No.", "Date & Time", "Amount", "Status", "Method"],
                    ["-", "-", f"Rs. 0.00 (due Rs. {_money(total)})", bill.status.replace('_', ' '), "-"]]
    el.append(_grid(pay_rows, [30 * mm, 42 * mm, 46 * mm, 26 * mm, 26 * mm]))

    sig = Table([["Patient's Signature", "Authorized Signatory"]], colWidths=[85 * mm, 85 * mm])
    sig.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (0, 0), 0.5, colors.black),
        ("LINEABOVE", (1, 0), (1, 0), 0.5, colors.black),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
    ]))
    el.append(Spacer(1, 30))
    el.append(sig)

    doc.build(el)
    buffer.seek(0)
    return buffer.read()


def generate_patient_list_pdf(patients: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = [Paragraph("Patient List Report", styles["Title"]), Spacer(1, 0.2 * inch)]
    data = [["ID", "Name", "Email", "Phone", "DOB", "Blood Type"]]
    for p in patients:
        data.append([str(p.patient_id), p.name, p.email, p.phone, str(p.date_of_birth), p.blood_type or "-"])
    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


def generate_appointments_pdf(appointments: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = [Paragraph("Appointments Report", styles["Title"]), Spacer(1, 0.2 * inch)]
    data = [["ID", "Patient", "Doctor", "Date/Time", "Status"]]
    for a in appointments:
        data.append([
            str(a.appointment_id),
            a.patient.name if a.patient else "-",
            a.doctor.name if a.doctor else "-",
            a.appointment_date_time.strftime("%Y-%m-%d %H:%M"),
            a.status,
        ])
    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
