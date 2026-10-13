import time
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Generic, TypeVar, List
from pydantic import Field
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    status: int
    message: str
    data: Optional[T] = None
    timestamp: int = 0

    def __init__(self, **data):
        if not data.get("timestamp"):
            data["timestamp"] = int(time.time() * 1000)
        super().__init__(**data)


# ==================== PATIENT ====================
class PatientDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    patient_id: int
    name: str
    email: str
    phone: str
    date_of_birth: date
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    medical_history: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreatePatientDTO(BaseModel):
    name: str
    email: str
    phone: str
    date_of_birth: date
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    medical_history: Optional[str] = None


class UpdatePatientDTO(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    blood_type: Optional[str] = None
    medical_history: Optional[str] = None


# ==================== DOCTOR ====================
class DoctorDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    doctor_id: int
    name: str
    email: str
    phone: str
    specialization: str
    years_of_experience: int
    qualifications: Optional[str] = None
    bio: Optional[str] = None
    office: Optional[str] = None
    consultation_fee: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateDoctorDTO(BaseModel):
    name: str
    email: str
    phone: str
    specialization: str
    years_of_experience: int
    qualifications: Optional[str] = None
    bio: Optional[str] = None
    office: Optional[str] = None
    consultation_fee: float


class UpdateDoctorDTO(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    years_of_experience: Optional[int] = None
    qualifications: Optional[str] = None
    bio: Optional[str] = None
    office: Optional[str] = None
    consultation_fee: Optional[float] = None
    status: Optional[str] = None


# ==================== APPOINTMENT ====================
class AppointmentDTO(BaseModel):
    appointment_id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    appointment_date_time: datetime
    duration_in_minutes: int
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: str
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateAppointmentDTO(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date_time: datetime
    duration_in_minutes: Optional[int] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class UpdateAppointmentDTO(BaseModel):
    appointment_date_time: Optional[datetime] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None


# ==================== BILLING ====================
class BillingDTO(BaseModel):
    billing_id: int
    patient_id: int
    patient_name: str
    appointment_id: Optional[int] = None
    amount: Decimal
    description: Optional[str] = None
    status: str
    payment_method: Optional[str] = None
    payment_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateBillingDTO(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    amount: Decimal
    description: Optional[str] = None


class UpdateBillingDTO(BaseModel):
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None


class MarkPaidDTO(BaseModel):
    payment_method: str


# ==================== DEPARTMENT ====================
class DepartmentDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    department_id: int
    name: str
    description: Optional[str] = None
    head_doctor_id: Optional[int] = None
    phone: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateDepartmentDTO(BaseModel):
    name: str
    description: Optional[str] = None
    head_doctor_id: Optional[int] = None
    phone: Optional[str] = None


class UpdateDepartmentDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    head_doctor_id: Optional[int] = None
    phone: Optional[str] = None


# ==================== EQUIPMENT ====================
class EquipmentDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    equipment_id: int
    name: str
    department_id: Optional[int] = None
    quantity: Optional[int] = None
    purchase_date: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateEquipmentDTO(BaseModel):
    name: str
    department_id: Optional[int] = None
    quantity: Optional[int] = 1
    purchase_date: Optional[date] = None
    status: Optional[str] = "WORKING"


class UpdateEquipmentDTO(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    status: Optional[str] = None


# ==================== MEDICAL RECORD ====================
class MedicalRecordDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    record_id: int
    patient_id: int
    appointment_id: Optional[int] = None
    record_type: Optional[str] = None
    content: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateMedicalRecordDTO(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    record_type: Optional[str] = None
    content: Optional[str] = None


class UpdateMedicalRecordDTO(BaseModel):
    record_type: Optional[str] = None
    content: Optional[str] = None


# ==================== PRESCRIPTION ====================
class PrescriptionDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    prescription_id: int
    appointment_id: int
    patient_id: int
    medication: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreatePrescriptionDTO(BaseModel):
    appointment_id: int
    patient_id: int
    medication: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    notes: Optional[str] = None


# ==================== SERVICE CATALOG ====================
class ServiceCatalogDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    service_id: int
    name: str
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    department_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateServiceCatalogDTO(BaseModel):
    name: str
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    department_id: Optional[int] = None


class UpdateServiceCatalogDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = None


# ==================== STAFF ====================
class StaffDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    staff_id: int
    name: str
    email: str
    phone: str
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[Decimal] = None
    join_date: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateStaffDTO(BaseModel):
    name: str
    email: str
    phone: str
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[Decimal] = None
    join_date: Optional[date] = None


class UpdateStaffDTO(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[Decimal] = None
    status: Optional[str] = None


# ==================== USER / AUTH ====================
class UserDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: int
    username: str
    email: str
    role: str
    status: str
    created_at: datetime
    # Populated only for DOCTOR-role accounts linked to a real doctors row -
    # this is what lets the UI show "Dr. Rajesh Kumar - Cardiology" instead
    # of the raw login username.
    doctor_id: Optional[int] = None
    display_name: Optional[str] = None
    specialization: Optional[str] = None


class RegisterDTO(BaseModel):
    username: str
    email: str
    password: str
    role: str = "PATIENT"


class LoginDTO(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserDTO


class ChangePasswordDTO(BaseModel):
    old_password: str
    new_password: str


class ForgotPasswordDTO(BaseModel):
    email: str


class ResetPasswordDTO(BaseModel):
    email: str
    otp: str
    new_password: str


# ==================== DASHBOARD ====================
class DashboardStatsDTO(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    pending_appointments: int
    completed_appointments: int
    total_revenue: Decimal
    pending_bills_amount: Decimal
    total_staff: int


class RevenuePointDTO(BaseModel):
    period: str
    revenue: Decimal


class AppointmentsPerDayDTO(BaseModel):
    date: str
    count: int


# ==================== AUDIT LOG ====================
class AuditLogDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    audit_id: int
    user_id: Optional[int] = None
    username: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime


# ==================== NOTIFICATIONS ====================
class NotificationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    notification_id: int
    type: str
    title: str
    message: str
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    is_read: bool
    created_at: datetime


# ==================== FILE UPLOADS ====================
class UploadedFileDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    file_id: int
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    original_filename: str
    file_type: Optional[str] = None
    description: Optional[str] = None
    uploaded_at: datetime


# ==================== USER PROFILE ====================
class ProfileDTO(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    display_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None


class UpdateProfileDTO(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def blank_date_to_none(cls, v):
        # A form field left empty submits "" - without this, Pydantic
        # rejects "" as an invalid date and the whole save fails.
        return None if v == "" else v



# ==================== QUEUE MANAGEMENT ====================
class QueueEntryDTO(BaseModel):
    queue_id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    token_number: int
    status: str
    checked_in_at: datetime
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class CreateQueueEntryDTO(BaseModel):
    patient_id: int
    doctor_id: int


# ==================== LAB & RADIOLOGY ====================
class LabOrderDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_id: int
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    test_type: str
    test_name: str
    status: str
    result_text: Optional[str] = None
    result_file_id: Optional[int] = None
    ordered_at: datetime
    completed_at: Optional[datetime] = None


class CreateLabOrderDTO(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    test_type: str  # LAB or RADIOLOGY
    test_name: str


class UpdateLabResultDTO(BaseModel):
    status: Optional[str] = None
    result_text: Optional[str] = None
    result_file_id: Optional[int] = None


# ==================== PHARMACY & INVENTORY ====================
class MedicationDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    medication_id: int
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    stock_quantity: int
    reorder_level: int
    price: Decimal
    interacts_with: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class CreateMedicationDTO(BaseModel):
    name: str
    category: Optional[str] = None
    unit: Optional[str] = None
    stock_quantity: int = 0
    reorder_level: int = 10
    price: Decimal = Decimal("0")
    interacts_with: Optional[str] = None  # comma-separated medication names


class UpdateMedicationDTO(BaseModel):
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    price: Optional[Decimal] = None
    interacts_with: Optional[str] = None


class DispenseMedicationDTO(BaseModel):
    prescription_id: Optional[int] = None
    patient_id: int
    medication_id: int
    quantity: int


class DispenseResultDTO(BaseModel):
    dispense_id: int
    medication_name: str
    quantity: int
    remaining_stock: int
    interaction_warning: Optional[str] = None


# ==================== WARD / BED / OT ====================
class WardDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    ward_id: int
    name: str
    ward_type: str
    total_beds: int


class CreateWardDTO(BaseModel):
    name: str
    ward_type: str = "GENERAL"
    total_beds: int = 0


class BedDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    bed_id: int
    ward_id: int
    bed_number: str
    status: str
    patient_id: Optional[int] = None
    admitted_at: Optional[datetime] = None


class CreateBedDTO(BaseModel):
    ward_id: int
    bed_number: str


class AdmitPatientDTO(BaseModel):
    patient_id: int


class OTBookingDTO(BaseModel):
    ot_booking_id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    ot_room: str
    procedure_name: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    status: str
    notes: Optional[str] = None


class CreateOTBookingDTO(BaseModel):
    patient_id: int
    doctor_id: int
    ot_room: str
    procedure_name: Optional[str] = None
    scheduled_start: datetime
    scheduled_end: datetime
    notes: Optional[str] = None


class UpdateOTBookingDTO(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


# ==================== INSURANCE CLAIMS ====================
class InsuranceClaimDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    claim_id: int
    billing_id: int
    patient_id: int
    insurance_provider: str
    policy_number: str
    claim_amount: Decimal
    status: str
    notes: Optional[str] = None
    submitted_at: datetime
    resolved_at: Optional[datetime] = None


class CreateInsuranceClaimDTO(BaseModel):
    billing_id: int
    patient_id: int
    insurance_provider: str
    policy_number: str
    claim_amount: Decimal
    notes: Optional[str] = None


class UpdateInsuranceClaimDTO(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


# ==================== PATIENT PORTAL ====================
class LinkPatientAccountDTO(BaseModel):
    patient_id: int


# ==================== BILL CHARGES ====================
class BillItemDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    item_id: int
    billing_id: int
    category: str
    description: str
    quantity: int
    unit_price: Decimal
    amount: Decimal
    created_at: datetime
    service_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CreateBillItemDTO(BaseModel):
    category: str
    description: str
    quantity: int = 1
    unit_price: Decimal
    service_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BillLineDTO(BaseModel):
    category: str
    description: str
    quantity: int = 1
    unit_price: Decimal
    service_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CreateBillWithItemsDTO(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    description: str
    lines: List[BillLineDTO]

class PublicBookDTO(BaseModel):
        name: str = Field(..., min_length=2, max_length=120, pattern=r"^[^<>]+$")
email: EmailStr
phone: str = Field(..., min_length=6, max_length=20, pattern=r"^[0-9+\- ]+$")
date_of_birth: date
gender: str = Field(..., pattern=r"^(Male|Female|Other)$")
doctor_id: int
appointment_date_time: datetime
reason: str = Field(..., min_length=2, max_length=500, pattern=r"^[^<>]+$")



