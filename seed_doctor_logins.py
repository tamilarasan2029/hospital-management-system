"""
Gives every doctor a login with a unique, strong, randomly generated password.
- Doctors without a login get a new one.
- Doctors who already have a login get a new password.
The passwords are printed ONCE on screen. Copy them before closing the terminal.

Run:
    python seed_doctor_logins.py

Afterwards, each doctor should change their password under
My Profile > Change Password.
"""
import re
import secrets
import string
from app.database import SessionLocal, Base, engine
from app.models import User, Doctor
from app.security import hash_password, validate_password_strength

Base.metadata.create_all(bind=engine)

SPECIALS = "!@#$%^&*-_=+?"


def make_password(length: int = 14) -> str:
    chars = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice(SPECIALS),
    ]
    pool = string.ascii_letters + string.digits + SPECIALS
    chars += [secrets.choice(pool) for _ in range(length - len(chars))]
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", ".", name.lower()).strip(".")


db = SessionLocal()
doctors = db.query(Doctor).order_by(Doctor.doctor_id).all()
if not doctors:
    print("No doctors in the doctors table. Add doctors first, then run this again.")
    db.close()
    raise SystemExit(0)

print(f"{'Doctor':<24} {'Login email':<36} {'Password'}")
print("-" * 90)
for doc in doctors:
    pw = make_password()
    validate_password_strength(pw)  # never saves a password that fails the rules

    user = db.query(User).filter(User.doctor_id == doc.doctor_id).first()
    if user:
        user.password = hash_password(pw)
        user.status = "ACTIVE"
        email = user.email
    else:
        username = f"dr.{slugify(doc.name)}"
        if db.query(User).filter(User.username == username).first():
            username = f"{username}.{doc.doctor_id}"
        email = (doc.email or "").lower().strip()
        if not email or db.query(User).filter(User.email == email).first():
            email = f"{username}@hospital.local"
        db.add(User(
            username=username, email=email, password=hash_password(pw),
            role="DOCTOR", status="ACTIVE", doctor_id=doc.doctor_id,
        ))
    print(f"{('Dr. ' + doc.name)[:24]:<24} {email:<36} {pw}")

db.commit()
db.close()
print("-" * 90)
print("Copy these now. They are not shown again.")
print("Each doctor should change theirs under My Profile > Change Password.")
