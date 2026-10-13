import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.database import Base, engine
from app.exceptions import NotFoundError, BusinessError, AuthError
from app.config import CORS_ORIGINS, ENABLE_DOCS
from app.security import decode_access_token
import jwt as _jwt
import threading
from collections import defaultdict, deque
from app.utils.scheduler import start_scheduler

from app.routers import (
    health, auth, patients, doctors, appointments, billing,
    departments, equipment, medical_records, prescriptions,
    catalog, staff, dashboard, reports, notifications, audit, files,
    queue, lab_orders, pharmacy, ward, insurance, portal,
)

load_dotenv()

# Creates any tables that don't exist yet (patients/doctors/appointments/billing/etc.
# already exist in your real DB; audit_log/notifications/uploaded_files are new and additive).
Base.metadata.create_all(bind=engine)
# bill_items already exists from an earlier version, so create_all won't add
# new columns to it. These run safely every start (IF NOT EXISTS).
from sqlalchemy import text as _sql_text
with engine.begin() as _conn:
    _conn.execute(_sql_text("ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS service_date TIMESTAMP"))
    _conn.execute(_sql_text("ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS end_date TIMESTAMP"))

app = FastAPI(
    title="Qwen Hospital Management System",
    version="0.2.0",
    docs_url="/docs" if ENABLE_DOCS else None,
    redoc_url=None,
    openapi_url="/openapi.json" if ENABLE_DOCS else None,
)


# ---------------- Security layer ----------------
# Every /api route needs a valid login, except the public list below.
PUBLIC_ENDPOINTS = {
    ("GET", "/api/health"),
    ("POST", "/api/auth/login"),
    ("POST", "/api/auth/forgot-password"),
    ("POST", "/api/auth/reset-password"),
    ("POST", "/api/appointments/public"),
}
ADMIN_ONLY_PREFIXES = (
    "/api/auth/register", "/api/audit-log", "/api/staff", "/api/departments", "/api/equipment",
    "/api/reports", "/api/dashboard", "/api/billing", "/api/insurance-claims", "/api/pharmacy",
    "/api/wards", "/api/ot-bookings", "/api/services", "/api/notifications",
)
# path -> (max attempts, window in seconds), per client address
RATE_LIMITS = {
    "/api/auth/login": (10, 300),
    "/api/auth/forgot-password": (5, 900),
    "/api/auth/reset-password": (10, 900),
    "/api/appointments/public": (20, 900),
}
_attempts = defaultdict(deque)
_attempts_lock = threading.Lock()


def _json_error(status: int, message: str):
    return JSONResponse(status_code=status, content={
        "status": status, "message": message, "data": None, "timestamp": int(time.time() * 1000),
    })


def _too_many_attempts(ip: str, path: str) -> bool:
    limit, window = RATE_LIMITS[path]
    now = time.time()
    with _attempts_lock:
        hits = _attempts[(ip, path)]
        while hits and now - hits[0] > window:
            hits.popleft()
        if len(hits) >= limit:
            return True
        hits.append(now)
        return False


def _is_public(method: str, path: str) -> bool:
    if method == "OPTIONS":
        return True
    if (method, path) in PUBLIC_ENDPOINTS:
        return True
    # The doctor directory is public so visitors can browse and book.
    if method == "GET" and (path == "/api/doctors" or path.startswith("/api/doctors/")):
        return True
    return False


def _is_admin_only(method: str, path: str) -> bool:
    if path.startswith(ADMIN_ONLY_PREFIXES):
        return True
    if path.startswith("/api/doctors") and method != "GET":
        return True
    if path.startswith("/api/patients") and method == "DELETE":
        return True
    return False


@app.middleware("http")
async def security_gate(request: Request, call_next):
    path = request.url.path
    method = request.method
    if not path.startswith("/api/"):
        return await call_next(request)

    if method == "POST" and path in RATE_LIMITS:
        ip = request.client.host if request.client else "unknown"
        if _too_many_attempts(ip, path):
            return _json_error(429, "Too many attempts. Please wait a few minutes and try again.")

    if _is_public(method, path):
        return await call_next(request)

    header = request.headers.get("authorization", "")
    if not header.lower().startswith("bearer "):
        return _json_error(401, "Please log in to continue.")
    try:
        payload = decode_access_token(header[7:].strip())
    except _jwt.PyJWTError:
        return _json_error(401, "Your session has expired. Please log in again.")

    role = payload.get("role")
    if role == "PATIENT" and not path.startswith(("/api/auth", "/api/portal")):
        return _json_error(403, "This account can't access that page.")
    if _is_admin_only(method, path) and role != "ADMIN":
        return _json_error(403, "Only administrators can do this.")
    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)



@app.exception_handler(NotFoundError)
def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={
        "status": 404, "message": str(exc), "data": None, "timestamp": int(time.time() * 1000)
    })


@app.exception_handler(BusinessError)
def business_error_handler(request: Request, exc: BusinessError):
    return JSONResponse(status_code=400, content={
        "status": 400, "message": str(exc), "data": None, "timestamp": int(time.time() * 1000)
    })


@app.exception_handler(AuthError)
def auth_error_handler(request: Request, exc: AuthError):
    return JSONResponse(status_code=401, content={
        "status": 401, "message": str(exc), "data": None, "timestamp": int(time.time() * 1000)
    })


@app.exception_handler(ValueError)
def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={
        "status": 400, "message": str(exc), "data": None, "timestamp": int(time.time() * 1000)
    })


# ---- Routers ----
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)
app.include_router(billing.router)
app.include_router(departments.router)
app.include_router(equipment.router)
app.include_router(medical_records.router)
app.include_router(prescriptions.router)
app.include_router(catalog.router)
app.include_router(staff.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(audit.router)
app.include_router(files.router)
app.include_router(queue.router)
app.include_router(lab_orders.router)
app.include_router(pharmacy.router)
app.include_router(ward.router)
app.include_router(ward.ot_router)
app.include_router(insurance.router)
app.include_router(portal.router)


@app.on_event("startup")
def on_startup():
    # Background jobs (item 11): auto-complete past appointments, flag overdue bills,
    # send upcoming-appointment reminders. Runs on a schedule, no manual trigger needed.
    start_scheduler()


if __name__ == "__main__":
    import uvicorn
    from app.config import PORT
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True)
