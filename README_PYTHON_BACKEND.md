# Hospital Management System — Python Backend (v2, full build)

This is the same frontend you already had, paired with a **much larger Python backend**
covering all 12 planned feature areas — not just the original patients/doctors/appointments.

## What's new vs. the earlier version

1. **Billing** — real API (`/api/billing`), not localStorage. Create, mark paid, delete,
   list per patient, and download a generated PDF invoice.
2. **Authentication** — `/api/auth/register` and `/api/auth/login` with bcrypt password
   hashing and JWT tokens. Role-based access (ADMIN/DOCTOR/STAFF/PATIENT).
3. **Previously-unused database tables now have full APIs**: departments, equipment,
   medical records, prescriptions, service catalog, staff.
4. **Dashboard analytics** — `/api/dashboard/stats` (uses your real `dashboard_stats` DB
   view), plus revenue-by-month and appointments-per-day for charts.
5. **Notifications** — appointment reminders, overdue-bill alerts, low-equipment-stock
   alerts, generated automatically by background jobs.
6. **Reports** — download patients as PDF, appointments as PDF or Excel, billing as CSV.
7. **File uploads** — attach documents (PDF/images) to a patient record.
8. **Advanced search/filtering** — `/api/patients/filter` and `/api/doctors/filter`
   support combining multiple criteria at once.
9. **Audit logging** — every create/update/delete/login is recorded in `audit_log`,
   viewable at `/api/audit-log` (admin only).
10. **Real scheduling logic** — appointment conflict detection now checks actual time
    overlap (not just identical start times), and there's a `/api/doctors/{id}/available-slots`
    endpoint that computes free slots for a given day.
11. **Background jobs** — hourly: auto-marks past appointments as COMPLETED. Daily:
    flags bills pending 30+ days. Every 6 hours: creates reminders for appointments in
    the next 24 hours.
12. **Automated tests** — a real `pytest` suite in `tests/` covering patients, auth,
    appointments (including the conflict-detection logic), and billing.

The original patients/doctors/appointments endpoints work exactly as before — nothing
that already worked was changed, only added to.

## Setup (same process as before)

```
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Check `.env` matches your real Postgres credentials (defaults to `postgres`/`root`/`hospital_db`,
same as your original Java config).

Start the backend:
```
uvicorn app.main:app --reload --port 8080
```

Start the frontend in a separate terminal:
```
npm install
npm start
```

## Running the tests

```
pip install pytest httpx
pytest
```

Tests run against an isolated in-memory SQLite database — they never touch your real
Postgres data.

## Exploring the new API

Visit `http://localhost:8080/docs` — every endpoint listed above is there, documented,
and testable directly from the browser.

## Note on your frontend

Your existing React components (Billing.js, LoginPage.js, etc.) still use localStorage
and don't call these new endpoints yet — the backend is ready and waiting, but wiring
the frontend to actually use `/api/billing`, `/api/auth/login`, etc. instead of
localStorage is a separate next step. Ask if you'd like that done too.
