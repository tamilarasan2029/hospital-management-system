from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, UploadedFileDTO
from app.services import file_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/files", tags=["files"])


@router.post("/upload", response_model=ApiResponse[UploadedFileDTO], status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    patient_id: Optional[int] = Form(None),
    doctor_id: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    content = await file.read()
    record = file_service.save_file(
        db, file.filename, content, patient_id=patient_id, doctor_id=doctor_id,
        description=description, current_user=current_user,
    )
    return ApiResponse(status=201, message="File uploaded successfully", data=UploadedFileDTO.model_validate(record))


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[UploadedFileDTO]])
def get_patient_files(patient_id: int, db: Session = Depends(get_db)):
    data = [UploadedFileDTO.model_validate(f) for f in file_service.get_patient_files(db, patient_id)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{file_id}/download")
def download_file(file_id: int, db: Session = Depends(get_db)):
    path, original_filename = file_service.get_file_path(db, file_id)
    return FileResponse(path, filename=original_filename)


@router.delete("/{file_id}", response_model=ApiResponse[None])
def delete_file(file_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    file_service.delete_file(db, file_id, current_user)
    return ApiResponse(status=200, message="File deleted", data=None)
