from sqlalchemy.orm import Session
from app.models import User, UserProfile
from app.schemas import ProfileDTO, UpdateProfileDTO
from app.exceptions import AuthError
from app.utils.audit import log_action


def _to_dto(user: User, profile: UserProfile) -> ProfileDTO:
    return ProfileDTO(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        role=user.role,
        display_name=profile.display_name if profile else None,
        phone=profile.phone if profile else None,
        date_of_birth=profile.date_of_birth if profile else None,
        address=profile.address if profile else None,
        city=profile.city if profile else None,
        state=profile.state if profile else None,
        country=profile.country if profile else None,
        pincode=profile.pincode if profile else None,
    )


def get_profile(db: Session, user: User) -> ProfileDTO:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()
    return _to_dto(user, profile)


def update_profile(db: Session, user: User, dto: UpdateProfileDTO) -> ProfileDTO:
    if dto.email is not None and dto.email.lower().strip() != user.email:
        new_email = dto.email.lower().strip()
        if db.query(User).filter(User.email == new_email, User.user_id != user.user_id).first():
            raise AuthError("Email already in use by another account")
        user.email = new_email

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.user_id).first()
    if not profile:
        profile = UserProfile(user_id=user.user_id)
        db.add(profile)

    for field in ("display_name", "phone", "date_of_birth", "address", "city", "state", "country", "pincode"):
        value = getattr(dto, field)
        if value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(user)
    db.refresh(profile)
    log_action(db, user, "UPDATE", "UserProfile", user.user_id, "Profile updated")
    return _to_dto(user, profile)
