from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    ApiResponse, RegisterDTO, LoginDTO, TokenResponse, UserDTO, ChangePasswordDTO,
    ProfileDTO, UpdateProfileDTO, ForgotPasswordDTO, ResetPasswordDTO,
)
from app.services import auth_service, profile_service
from app.deps import get_current_user, require_roles
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=ApiResponse[UserDTO], status_code=201)
def register(dto: RegisterDTO, db: Session = Depends(get_db), _admin=Depends(require_roles("ADMIN"))):
    user = auth_service.register_user(db, dto)
    return ApiResponse(status=201, message="User registered successfully", data=UserDTO.model_validate(user))


@router.post("/login", response_model=ApiResponse[TokenResponse])
def login(dto: LoginDTO, db: Session = Depends(get_db)):
    token, user = auth_service.login_user(db, dto)
    data = TokenResponse(access_token=token, user=auth_service.build_user_dto(db, user))
    return ApiResponse(status=200, message="Login successful", data=data)


@router.get("/me", response_model=ApiResponse[UserDTO])
def me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ApiResponse(status=200, message="Success", data=auth_service.build_user_dto(db, current_user))


@router.post("/change-password", response_model=ApiResponse[None])
def change_password(dto: ChangePasswordDTO, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    auth_service.change_password(db, current_user, dto.old_password, dto.new_password)
    return ApiResponse(status=200, message="Password changed successfully", data=None)


@router.post("/forgot-password", response_model=ApiResponse[None])
def forgot_password(dto: ForgotPasswordDTO, db: Session = Depends(get_db)):
    auth_service.request_password_reset(db, dto.email)
    # Same message whether or not the email exists, on purpose - this
    # doesn't confirm to a stranger which emails have accounts.
    return ApiResponse(
        status=200,
        message="If that email is registered, a reset code has been sent.",
        data=None,
    )


@router.post("/reset-password", response_model=ApiResponse[None])
def reset_password(dto: ResetPasswordDTO, db: Session = Depends(get_db)):
    auth_service.reset_password_with_otp(db, dto.email, dto.otp, dto.new_password)
    return ApiResponse(status=200, message="Password reset successfully. You can now log in.", data=None)


@router.get("/profile", response_model=ApiResponse[ProfileDTO])
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = profile_service.get_profile(db, current_user)
    return ApiResponse(status=200, message="Success", data=profile)


@router.put("/profile", response_model=ApiResponse[ProfileDTO])
def update_profile(dto: UpdateProfileDTO, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    profile = profile_service.update_profile(db, current_user, dto)
    return ApiResponse(status=200, message="Profile updated successfully", data=profile)
