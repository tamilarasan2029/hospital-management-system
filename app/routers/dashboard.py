from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, DashboardStatsDTO, RevenuePointDTO, AppointmentsPerDayDTO
from app.services import dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=ApiResponse[DashboardStatsDTO])
def get_stats(db: Session = Depends(get_db)):
    stats = dashboard_service.get_stats(db)
    return ApiResponse(status=200, message="Success", data=stats)


@router.get("/revenue", response_model=ApiResponse[List[RevenuePointDTO]])
def get_revenue(months: int = 6, db: Session = Depends(get_db)):
    data = dashboard_service.get_revenue_by_month(db, months)
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/appointments-per-day", response_model=ApiResponse[List[AppointmentsPerDayDTO]])
def get_appointments_per_day(days: int = 14, db: Session = Depends(get_db)):
    data = dashboard_service.get_appointments_per_day(db, days)
    return ApiResponse(status=200, message="Success", data=data)
