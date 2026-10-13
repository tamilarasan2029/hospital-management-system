from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timedelta
from app.models import User, Doctor, UserProfile
from app.schemas import RegisterDTO, LoginDTO, UserDTO
from app.exceptions import AuthError
from app.security import (
    hash_password, verify_password, create_access_token,
    validate_password_strength, generate_otp, hash_otp, verify_otp,
)
from app.utils.audit import log_action
from app.utils.email import send_otp_email

VALID_ROLES = {"ADMIN", "DOCTOR", "STAFF", "PATIENT"}


def build_user_dto(db: Session, user: User) -> UserDTO:
    """Builds the user object sent to the frontend on login/me. If this
    account is linked to a real Doctor row, pulls the doctor's actual name
    and specialization so the UI never has to fall back to the raw username."""
    display_name = None
    specialization = None

    if user.doctor_id:
        doctor = db.query(Doctor).filter(Doctor.doctor_id == user.doctor_id).first()
        if doctor:
            display_name = doctor.name
            specialization = doctor.specialization

    if not display_name:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()
        if profile and profile.display_name:
            display_name = profile.display_name

    return UserDTO(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
        doctor_id=user.doctor_id,
        display_name=display_name,
        specialization=specialization,
    )


def register_user(db: Session, dto: RegisterDTO) -> User:
    email = dto.email.lower().strip()
    username = dto.username.strip()

    if db.query(User).filter(User.username == username).first():
        raise AuthError("Username already taken")
    if db.query(User).filter(User.email == email).first():
        raise AuthError("Email already registered")

    role = dto.role.upper() if dto.role else "PATIENT"
    if role not in VALID_ROLES:
        raise AuthError(f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}")

    validate_password_strength(dto.password)

    user = User(
        username=username,
        email=email,
        password=hash_password(dto.password),
        role=role,
        status="ACTIVE",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    log_action(db, user, "CREATE", "User", user.user_id, f"Registered new user {user.username} ({role})")
    return user


def login_user(db: Session, dto: LoginDTO):
    identifier = dto.username.strip().lower()
    user = db.query(User).filter(
        or_(User.username == identifier, User.email == identifier)
    ).first()
    if not user or not verify_password(dto.password, user.password):
        raise AuthError("Invalid username or password")
    if user.status != "ACTIVE":
        raise AuthError("Account is not active")

    token = create_access_token(user.user_id, user.username, user.role)
    log_action(db, user, "LOGIN", "User", user.user_id, "User logged in")
    return token, user


def change_password(db: Session, user: User, old_password: str, new_password: str):
    if not verify_password(old_password, user.password):
        raise AuthError("Old password is incorrect")
    validate_password_strength(new_password)
    user.password = hash_password(new_password)
    db.commit()
    log_action(db, user, "UPDATE", "User", user.user_id, "Password changed")


def request_password_reset(db: Session, email: str):
    from app.models import PasswordResetOTP

    email = email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Deliberately don't reveal whether the email exists - the caller
        # sees the same "check your email" message either way.
        return

    otp = generate_otp()
    entry = PasswordResetOTP(
        user_id=user.user_id,
        otp_hash=hash_otp(otp),
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(entry)
    db.commit()

    send_otp_email(user.email, otp)
    log_action(db, user, "UPDATE", "User", user.user_id, "Requested password reset OTP")


def reset_password_with_otp(db: Session, email: str, otp: str, new_password: str):
    from app.models import PasswordResetOTP

    email = email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise AuthError("Invalid or expired code")

    entry = (
        db.query(PasswordResetOTP)
        .filter(PasswordResetOTP.user_id == user.user_id, PasswordResetOTP.used == False)  # noqa: E712
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )
    if not entry or entry.expires_at < datetime.utcnow():
        raise AuthError("Invalid or expired code")
    if not verify_otp(otp, entry.otp_hash):
        raise AuthError("Invalid or expired code")

    validate_password_strength(new_password)

    user.password = hash_password(new_password)
    entry.used = True
    db.commit()
    log_action(db, user, "UPDATE", "User", user.user_id, "Password reset via OTP")
