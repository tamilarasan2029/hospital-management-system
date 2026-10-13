"""
Run this once to populate the service catalog with common billable items:
    python seed_services.py

Safe to run multiple times - skips any service that already exists by name.
"""
from app.database import SessionLocal, Base, engine
from app.models import ServiceCatalog

Base.metadata.create_all(bind=engine)
db = SessionLocal()

services = [
    {"name": "General Consultation", "cost": 300, "description": "Standard doctor consultation"},
    {"name": "Cardiology Consultation", "cost": 800, "description": "Specialist heart consultation"},
    {"name": "Blood Test - Complete Panel", "cost": 450, "description": "Full blood workup"},
    {"name": "X-Ray", "cost": 600, "description": "Standard X-ray imaging"},
    {"name": "MRI Scan", "cost": 4500, "description": "Magnetic resonance imaging"},
    {"name": "Minor Surgery", "cost": 5000, "description": "Outpatient minor surgical procedure"},
    {"name": "Physiotherapy Session", "cost": 400, "description": "One physiotherapy session"},
    {"name": "Room Charges (per day)", "cost": 2000, "description": "Inpatient room, per day"},
]

for s in services:
    existing = db.query(ServiceCatalog).filter(ServiceCatalog.name == s["name"]).first()
    if existing:
        print(f"Skipping '{s['name']}' - already exists")
        continue
    db.add(ServiceCatalog(**s))
    db.commit()
    print(f"Added service: {s['name']} (₹{s['cost']})")

db.close()
print("\nDone. These will now show up in the Billing 'Billing Item' dropdown.")
