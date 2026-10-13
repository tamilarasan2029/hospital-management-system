from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import report_service

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/patients/pdf")
def patients_pdf(db: Session = Depends(get_db)):
    pdf_bytes = report_service.patients_pdf(db)
    return Response(content=pdf_bytes, media_type="application/pdf",
                     headers={"Content-Disposition": "attachment; filename=patients_report.pdf"})


@router.get("/appointments/pdf")
def appointments_pdf(db: Session = Depends(get_db)):
    pdf_bytes = report_service.appointments_pdf(db)
    return Response(content=pdf_bytes, media_type="application/pdf",
                     headers={"Content-Disposition": "attachment; filename=appointments_report.pdf"})


@router.get("/appointments/excel")
def appointments_excel(db: Session = Depends(get_db)):
    xlsx_bytes = report_service.appointments_excel(db)
    return Response(content=xlsx_bytes, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     headers={"Content-Disposition": "attachment; filename=appointments_report.xlsx"})


@router.get("/billing/csv")
def billing_csv(db: Session = Depends(get_db)):
    csv_bytes = report_service.bills_csv(db)
    return Response(content=csv_bytes, media_type="text/csv",
                     headers={"Content-Disposition": "attachment; filename=billing_report.csv"})
