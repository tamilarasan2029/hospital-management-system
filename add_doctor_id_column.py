"""
One-time fix: adds the 'doctor_id' column to your existing 'users' table.

This is needed because SQLAlchemy's automatic table creation only creates
BRAND NEW tables - it never adds columns to a table that already exists.
Since 'users' already existed in your database (from the original schema),
the new doctor_id column had to be added manually. Run this once:

    python add_doctor_id_column.py

Safe to run multiple times - does nothing if the column is already there.
"""
from sqlalchemy import text
from app.database import engine

with engine.connect() as conn:
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES doctors(doctor_id)
    """))
    conn.commit()

print("Done. The 'users' table now has a doctor_id column.")
print("You can now run: python seed_doctor_logins.py")
