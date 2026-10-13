"""
One-time fix: adds the 'payment_method' column to your existing 'billing'
table (same situation as doctor_id before - this table already existed in
your real database, so it needs a manual ALTER, not just a server restart).

Run once:
    python add_payment_method_column.py

Safe to run multiple times.
"""
from sqlalchemy import text
from app.database import engine

with engine.connect() as conn:
    conn.execute(text("""
        ALTER TABLE billing
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30)
    """))
    conn.commit()

print("Done. The 'billing' table now has a payment_method column.")
