from fastapi import APIRouter
from app.schemas import ApiResponse

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=ApiResponse[str])
def health():
    return ApiResponse(status=200, message="Qwen Hospital Management System is running", data="OK")
