from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Numeric, DateTime, Date, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String)
    blood_type = Column(String(10))
    medical_history = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="patient")
    bills = relationship("Billing", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")


class Doctor(Base):
    __tablename__ = "doctors"

    doctor_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    years_of_experience = Column(Integer, nullable=False)
    qualifications = Column(String)
    bio = Column(Text)
    office = Column(String(100))
    consultation_fee = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="AVAILABLE")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    appointments = relationship("Appointment", back_populates="doctor")


class Appointment(Base):
    __tablename__ = "appointments"

    appointment_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    appointment_date_time = Column(DateTime, nullable=False)
    duration_in_minutes = Column(Integer, nullable=False, default=30)
    reason = Column(Text)
    notes = Column(Text)
    status = Column(String(20), nullable=False, default="SCHEDULED")
    diagnosis = Column(Text)
    prescription = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    bills = relationship("Billing", back_populates="appointment")
    medical_records = relationship("MedicalRecord", back_populates="appointment")
    prescriptions_detail = relationship("Prescription", back_populates="appointment")


class Billing(Base):
    __tablename__ = "billing"

    billing_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String(255))
    status = Column(String(20), nullable=False, default="PENDING")
    payment_method = Column(String(30), nullable=True)  # CASH, UPI, GPAY, CARD, ONLINE, CHEQUE, OTHER
    payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="bills")
    appointment = relationship("Appointment", back_populates="bills")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan", passive_deletes=True)


class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    head_doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=True)
    phone = Column(String(20))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="department")
    services = relationship("ServiceCatalog", back_populates="department")


class Equipment(Base):
    __tablename__ = "equipment"

    equipment_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=True)
    quantity = Column(Integer, default=1)
    purchase_date = Column(Date)
    status = Column(String(20), default="WORKING")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="equipment")


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    record_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=True)
    record_type = Column(String(100))
    content = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="medical_records")
    appointment = relationship("Appointment", back_populates="medical_records")


class Prescription(Base):
    __tablename__ = "prescriptions"

    prescription_id = Column(Integer, primary_key=True, autoincrement=True)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    medication = Column(String(255), nullable=False)
    dosage = Column(String(100))
    frequency = Column(String(100))
    duration = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="prescriptions")
    appointment = relationship("Appointment", back_populates="prescriptions_detail")


class ServiceCatalog(Base):
    """Hospital services offered (the DB's 'services' table) - named ServiceCatalog
    in Python to avoid clashing with the word 'service' used for business-logic modules."""
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cost = Column(Numeric(10, 2))
    department_id = Column(Integer, ForeignKey("departments.department_id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="services")


class Staff(Base):
    __tablename__ = "staff"

    staff_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    position = Column("position", String(100))
    department = Column(String(100))
    salary = Column(Numeric(10, 2))
    join_date = Column(Date)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # bcrypt hash
    role = Column(String, nullable=False)      # ADMIN, DOCTOR, STAFF, PATIENT
    status = Column(String(20), nullable=False, default="ACTIVE")
    # Links a DOCTOR-role login to their real row in the doctors table, so the
    # dashboard can show the actual logged-in doctor's name/specialization
    # instead of the account's raw username ("doctor").
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---- New tables, additive only (created_all won't touch existing ones) ----

class AuditLog(Base):
    __tablename__ = "audit_log"

    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    username = Column(String, nullable=True)
    action = Column(String(50), nullable=False)      # CREATE, UPDATE, DELETE, LOGIN
    entity_type = Column(String(50), nullable=False)  # Patient, Doctor, Appointment, Billing...
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(String(50), nullable=False)   # APPOINTMENT_REMINDER, OVERDUE_BILL, LOW_STOCK
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    reference_type = Column(String(50), nullable=True)
    reference_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    file_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=True)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class PasswordResetOTP(Base):
    """One-time codes for the Forgot Password flow. A brand-new table, so
    unlike doctor_id on the existing 'users' table, this one gets created
    automatically the next time the server starts - no manual SQL needed."""
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    otp_hash = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class UserProfile(Base):
    """Extended profile fields for a User account - kept in its own table
    (rather than altering the existing 'users' table) so nothing about your
    real database's original schema has to change."""
    __tablename__ = "user_profiles"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    display_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== QUEUE MANAGEMENT ====================
class QueueEntry(Base):
    __tablename__ = "queue_entries"

    queue_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    token_number = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="WAITING")  # WAITING, IN_PROGRESS, DONE, SKIPPED
    checked_in_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # These were missing entirely - queue_service.py reads entry.patient.name
    # and entry.doctor.name on every single queue operation, so without
    # these, check-in/call-next/etc. crashed every time with an unhandled
    # AttributeError. That crash strips CORS headers from the error
    # response, which is exactly why the browser reported it as
    # "could not reach the server" instead of a real error message.
    patient = relationship("Patient")
    doctor = relationship("Doctor")


# ==================== LAB & RADIOLOGY ====================
class LabOrder(Base):
    __tablename__ = "lab_orders"

    order_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.appointment_id"), nullable=True)
    test_type = Column(String(20), nullable=False)  # LAB or RADIOLOGY
    test_name = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="ORDERED")  # ORDERED, IN_PROGRESS, COMPLETED, CANCELLED
    result_text = Column(Text, nullable=True)
    result_file_id = Column(Integer, ForeignKey("uploaded_files.file_id"), nullable=True)
    ordered_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


# ==================== PHARMACY & INVENTORY ====================
class Medication(Base):
    __tablename__ = "medications"

    medication_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    category = Column(String(100), nullable=True)
    unit = Column(String(30), nullable=True)  # e.g. "tablet", "ml"
    stock_quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=10)
    price = Column(Numeric(10, 2), nullable=False, default=0)
    # Comma-separated medication names this one should not be combined with.
    # Kept simple (no separate join table) since interaction lists are short and static.
    interacts_with = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PharmacyDispense(Base):
    __tablename__ = "pharmacy_dispenses"

    dispense_id = Column(Integer, primary_key=True, autoincrement=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.prescription_id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    medication_id = Column(Integer, ForeignKey("medications.medication_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    dispensed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    dispensed_by_user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)


# ==================== WARD / BED / OT MANAGEMENT ====================
class Ward(Base):
    __tablename__ = "wards"

    ward_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    ward_type = Column(String(30), nullable=False, default="GENERAL")  # GENERAL, ICU, PRIVATE, OT
    total_beds = Column(Integer, nullable=False, default=0)


class Bed(Base):
    __tablename__ = "beds"

    bed_id = Column(Integer, primary_key=True, autoincrement=True)
    ward_id = Column(Integer, ForeignKey("wards.ward_id"), nullable=False)
    bed_number = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="AVAILABLE")  # AVAILABLE, OCCUPIED, MAINTENANCE
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=True)
    admitted_at = Column(DateTime, nullable=True)


class OTBooking(Base):
    __tablename__ = "ot_bookings"

    ot_booking_id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.doctor_id"), nullable=False)
    ot_room = Column(String(50), nullable=False)
    procedure_name = Column(String(255), nullable=True)
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    notes = Column(Text, nullable=True)


# ==================== INSURANCE CLAIMS ====================
class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"

    claim_id = Column(Integer, primary_key=True, autoincrement=True)
    billing_id = Column(Integer, ForeignKey("billing.billing_id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False)
    insurance_provider = Column(String(255), nullable=False)
    policy_number = Column(String(100), nullable=False)
    claim_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="SUBMITTED")  # SUBMITTED, APPROVED, REJECTED, PENDING
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


# ==================== PATIENT PORTAL LINKING ====================
class PatientAccount(Base):
    """Links a logged-in User (role=PATIENT) to their Patient record, so the
    patient portal endpoints know whose data to show without exposing everyone's."""
    __tablename__ = "patient_accounts"

    user_id = Column(Integer, ForeignKey("users.user_id"), primary_key=True)
    patient_id = Column(Integer, ForeignKey("patients.patient_id"), nullable=False, unique=True)


class BillItem(Base):
    """One charge on a bill: doctor fee, ward/bed, medicine, lab, radiology,
    operation theatre or other. A bill's total is the sum of its charges."""
    __tablename__ = "bill_items"

    item_id = Column(Integer, primary_key=True, autoincrement=True)
    billing_id = Column(Integer, ForeignKey("billing.billing_id", ondelete="CASCADE"), nullable=False)
    category = Column(String(30), nullable=False)
    description = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    service_date = Column(DateTime, nullable=True)   # admission / date of service
    end_date = Column(DateTime, nullable=True)       # discharge (bed charges)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    bill = relationship("Billing", back_populates="items")
