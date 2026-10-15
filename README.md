# 🏥 Qwen Hospital Management System

A full-stack hospital management system for managing patients, doctors, appointments, billing, pharmacy, wards, laboratory orders, queues and insurance claims.

- **Backend:** Python FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React (Create React App)
- **Security:** JWT login, bcrypt password hashing, role-based access, rate limiting, security headers

---

## ✨ Features

### 👨‍💼 Administrator
- 📊 Dashboard with totals and recent activity
- 👥 Patients: add, view, edit, delete (delete is blocked while records are linked)
- ⚕️ Doctors: view directory and specializations
- 📅 Appointments: book, edit, cancel
- 🩺 Medical history (EHR), prescriptions, lab and radiology orders
- 💊 Pharmacy and inventory, with stock alerts
- 🛏️ Wards, beds and operation theatre bookings
- 🎫 Walk-in queue management
- 💳 Billing: itemised bills (consultation, ward/bed by day, medicine, lab, radiology, procedures), PDF invoices
- 🛡️ Insurance claims
- ⚙️ Profile and password change

### 👨‍⚕️ Doctor
- 👨‍⚕️ My Patients and their medical history
- 🩺 Lab orders and results, prescriptions
- 🎫 Queue
- ⚙️ Profile and password change

### 🌐 Public (no login)
- Browse doctors and open time slots
- Book an appointment as a guest

---

## 📁 Project Structure

```
HospitalManagement/
├── app/                      # Python backend (FastAPI)
│   ├── main.py               # App setup, security gate, routers
│   ├── config.py             # Reads settings from .env
│   ├── models.py             # Database tables
│   ├── schemas.py            # Request and response models
│   ├── security.py           # Passwords and tokens
│   ├── routers/              # API endpoints
│   ├── services/             # Business logic
│   └── utils/                # PDF, scheduler, audit helpers
├── database/
│   └── schema.sql            # Database structure only (no data)
├── src/                      # React frontend
│   ├── App.js
│   └── components/           # Pages and screens
├── public/
├── tests/                    # Test files (optional)
├── seed_users.py             # Sets the admin password
├── seed_doctor_logins.py     # Creates doctor logins
├── seed_services.py          # Loads the service price list
├── seed_demo_patients.py     # Optional demo patients
├── requirements.txt
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or newer
- Node.js 18 or newer
- PostgreSQL 14 or newer

### 1. Create the database

In pgAdmin, create a database named `hospital_db`. Then load the structure:
- Open the Query Tool on `hospital_db`
- Open `database/schema.sql` and run it

### 2. Configure the backend

Copy `.env.example` to `.env` and fill in your values. Never commit `.env`.

Generate a JWT secret with:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### 3. Install and start the backend

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

### 4. Create the first logins

Run these once, in order:
```powershell
python seed_users.py            # asks you to type the admin password
python seed_doctor_logins.py    # creates a login for each doctor, prints passwords once
python seed_services.py         # loads the service price list
```

Optional, for testing only:
```powershell
python seed_demo_patients.py
```

### 5. Install and start the frontend

In a second terminal:
```powershell
npm install
npm start
```

Open **http://localhost:3000**.

---

## 🔐 Security Notes

- Patient and staff data needs a login. Only the doctor directory and public booking are open.
- Administrator-only areas (billing, staff, reports, audit log and similar) are enforced on the server.
- API documentation (`/docs`) is hidden unless `ENABLE_DOCS=true` is set in `.env`.
- The app will not start with a missing or weak `JWT_SECRET`.
- Login and booking requests are rate limited.
- Keep `.env`, `uploads/` and any database backup out of Git.
- Use HTTPS for any public deployment.

---

## 🧪 Useful Commands

| Task | Command |
|---|---|
| Start backend | `uvicorn app.main:app --reload --port 8080` |
| Start frontend | `npm start` |
| Check Python packages | `pip-audit -r requirements.txt` |
| Check npm packages | `npm audit` |

---

## 👨‍💻 Developer

Developed by **Tamilarasan V**.
