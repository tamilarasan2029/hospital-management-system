from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, ServiceCatalogDTO, CreateServiceCatalogDTO, UpdateServiceCatalogDTO
from app.services import catalog_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/services", tags=["service-catalog"])


@router.get("", response_model=ApiResponse[List[ServiceCatalogDTO]])
def get_all(db: Session = Depends(get_db)):
    data = [ServiceCatalogDTO.model_validate(s) for s in catalog_service.get_all(db)]
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{service_id}", response_model=ApiResponse[ServiceCatalogDTO])
def get_one(service_id: int, db: Session = Depends(get_db)):
    s = catalog_service.get_by_id(db, service_id)
    return ApiResponse(status=200, message="Success", data=ServiceCatalogDTO.model_validate(s))


@router.post("", response_model=ApiResponse[ServiceCatalogDTO], status_code=201)
def create(dto: CreateServiceCatalogDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    s = catalog_service.create(db, dto, current_user)
    return ApiResponse(status=201, message="Service created", data=ServiceCatalogDTO.model_validate(s))


@router.put("/{service_id}", response_model=ApiResponse[ServiceCatalogDTO])
def update(service_id: int, dto: UpdateServiceCatalogDTO, db: Session = Depends(get_db),
           current_user=Depends(get_current_user_optional)):
    s = catalog_service.update(db, service_id, dto, current_user)
    return ApiResponse(status=200, message="Service updated", data=ServiceCatalogDTO.model_validate(s))


@router.delete("/{service_id}", response_model=ApiResponse[None])
def delete(service_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    catalog_service.delete(db, service_id, current_user)
    return ApiResponse(status=200, message="Service deleted", data=None)
