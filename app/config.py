import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Add it to your .env file.")

PORT = int(os.getenv("BACKEND_PORT", 8080))
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
ENABLE_DOCS = os.getenv("ENABLE_DOCS", "false").lower() == "true"

JWT_SECRET = os.getenv("JWT_SECRET", "")
if len(JWT_SECRET) < 32 or "change" in JWT_SECRET.lower():
    raise RuntimeError("JWT_SECRET is missing or weak. Set a random value of at least 32 characters in .env.")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 480))

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Hospital details printed on every bill (set these in .env)
HOSPITAL_NAME = os.getenv("HOSPITAL_NAME", "Qwen Hospital")
HOSPITAL_ADDRESS = os.getenv("HOSPITAL_ADDRESS", "Your hospital address, city, state")
HOSPITAL_PHONE = os.getenv("HOSPITAL_PHONE", "+91 00000 00000")
HOSPITAL_TIMING = os.getenv("HOSPITAL_TIMING", "24 hours")