import os
import uuid
from sqlalchemy.orm import Session
from app.models import UploadedFile
from app.config import UPLOAD_DIR
from app.exceptions import NotFoundError
from app.utils.audit import log_action

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"}
MAX_FILE_SIZE_MB = 10


def save_file(db: Session, filename: str, content: bytes, patient_id: int = None,
              doctor_id: int = None, description: str = None, current_user=None) -> UploadedFile:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type {ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise ValueError(f"File exceeds {MAX_FILE_SIZE_MB}MB limit")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(UPLOAD_DIR, stored_name)
    with open(path, "wb") as f:
        f.write(content)

    record = UploadedFile(
        patient_id=patient_id,
        doctor_id=doctor_id,
        original_filename=filename,
        stored_filename=stored_name,
        file_type=ext.lstrip("."),
        description=description,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    log_action(db, current_user, "CREATE", "UploadedFile", record.file_id, filename)
    return record


def get_file_path(db: Session, file_id: int) -> str:
    record = db.query(UploadedFile).filter(UploadedFile.file_id == file_id).first()
    if not record:
        raise NotFoundError("File not found")
    return os.path.join(UPLOAD_DIR, record.stored_filename), record.original_filename


def get_patient_files(db: Session, patient_id: int):
    return db.query(UploadedFile).filter(UploadedFile.patient_id == patient_id).all()


def delete_file(db: Session, file_id: int, current_user=None) -> None:
    record = db.query(UploadedFile).filter(UploadedFile.file_id == file_id).first()
    if not record:
        raise NotFoundError("File not found")
    path = os.path.join(UPLOAD_DIR, record.stored_filename)
    if os.path.exists(path):
        os.remove(path)
    db.delete(record)
    db.commit()
    log_action(db, current_user, "DELETE", "UploadedFile", file_id)
