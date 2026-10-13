"""
Sets the admin password. The password is never stored in the code:
you type it when the script asks.

Run:
    python seed_users.py

Password rules: at least 8 characters, with one uppercase letter,
one number and one special character (for example: Hosp!tal2026).
Safe to re-run: it updates the existing admin password.
"""
import getpass
from app.database import SessionLocal, Base, engine
from app.models import User
from app.security import hash_password, validate_password_strength

Base.metadata.create_all(bind=engine)
EMAIL = "admin@hospital.com"

pw1 = getpass.getpass("New admin password (typing is hidden): ")
pw2 = getpass.getpass("Type it again: ")
if pw1 != pw2:
    print("The two passwords do not match. Nothing was changed.")
    raise SystemExit(1)
try:
    validate_password_strength(pw1)
except ValueError as e:
    print(e)
    print("Nothing was changed. Run the script again with a stronger password.")
    raise SystemExit(1)

db = SessionLocal()
admin = db.query(User).filter(User.email == EMAIL).first()
if admin:
    admin.password = hash_password(pw1)
    admin.role = "ADMIN"
    admin.status = "ACTIVE"
    print("Updated the existing admin password.")
else:
    db.add(User(username="admin", email=EMAIL, password=hash_password(pw1), role="ADMIN", status="ACTIVE"))
    print("Created the admin account.")
db.commit()
db.close()
print(f"Log in with {EMAIL} and the password you just set.")
