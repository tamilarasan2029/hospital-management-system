from typing import List, Optional
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApiResponse, BillingDTO, CreateBillingDTO, UpdateBillingDTO, MarkPaidDTO, BillItemDTO, CreateBillItemDTO, CreateBillWithItemsDTO
from app.services import billing_service, report_service
from app.deps import get_current_user_optional

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.get("", response_model=ApiResponse[List[BillingDTO]])
def get_all_bills(status: Optional[str] = None, patient_id: Optional[int] = None, db: Session = Depends(get_db)):
    data = billing_service.get_all_bills(db, status, patient_id)
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{billing_id}", response_model=ApiResponse[BillingDTO])
def get_bill(billing_id: int, db: Session = Depends(get_db)):
    bill = billing_service.get_bill_by_id(db, billing_id)
    from app.services.billing_service import _to_dto
    return ApiResponse(status=200, message="Success", data=_to_dto(bill))


@router.post("", response_model=ApiResponse[BillingDTO], status_code=201)
def create_bill(dto: CreateBillingDTO, db: Session = Depends(get_db),
                current_user=Depends(get_current_user_optional)):
    bill = billing_service.create_bill(db, dto, current_user)
    body = ApiResponse(status=201, message="Bill created successfully", data=bill)
    return JSONResponse(status_code=201, content=body.model_dump(mode="json"))


@router.put("/{billing_id}", response_model=ApiResponse[BillingDTO])
def update_bill(billing_id: int, dto: UpdateBillingDTO, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user_optional)):
    bill = billing_service.update_bill(db, billing_id, dto, current_user)
    return ApiResponse(status=200, message="Bill updated successfully", data=bill)


@router.put("/{billing_id}/pay", response_model=ApiResponse[BillingDTO])
def mark_bill_paid(billing_id: int, dto: MarkPaidDTO, db: Session = Depends(get_db),
                    current_user=Depends(get_current_user_optional)):
    bill = billing_service.mark_paid(db, billing_id, dto.payment_method, current_user)
    return ApiResponse(status=200, message="Bill marked as paid", data=bill)


@router.delete("/{billing_id}", response_model=ApiResponse[None])
def delete_bill(billing_id: int, db: Session = Depends(get_db),
                current_user=Depends(get_current_user_optional)):
    billing_service.delete_bill(db, billing_id, current_user)
    return ApiResponse(status=200, message="Bill deleted successfully", data=None)


@router.get("/patient/{patient_id}", response_model=ApiResponse[List[BillingDTO]])
def get_patient_bills(patient_id: int, db: Session = Depends(get_db)):
    data = billing_service.get_patient_bills(db, patient_id)
    return ApiResponse(status=200, message="Success", data=data)


@router.get("/{billing_id}/pdf")
def download_bill_pdf(billing_id: int, db: Session = Depends(get_db)):
    pdf_bytes = report_service.single_bill_pdf(db, billing_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{billing_id}.pdf"},
    )


@router.get("/{billing_id}/items", response_model=ApiResponse[List[BillItemDTO]])
def list_bill_items(billing_id: int, db: Session = Depends(get_db)):
    return ApiResponse(status=200, message="Success", data=billing_service.list_items(db, billing_id))


@router.post("/{billing_id}/items", response_model=ApiResponse[BillItemDTO], status_code=201)
def add_bill_item(billing_id: int, dto: CreateBillItemDTO, db: Session = Depends(get_db),
                  current_user=Depends(get_current_user_optional)):
    item = billing_service.add_item(db, billing_id, dto, current_user)
    return ApiResponse(status=201, message="Charge added", data=item)


@router.delete("/items/{item_id}", response_model=ApiResponse[None])
def delete_bill_item(item_id: int, db: Session = Depends(get_db),
                     current_user=Depends(get_current_user_optional)):
    billing_service.delete_item(db, item_id, current_user)
    return ApiResponse(status=200, message="Charge removed", data=None)


@router.post("/with-items", response_model=ApiResponse[BillingDTO], status_code=201)
def create_bill_with_items(dto: CreateBillWithItemsDTO, db: Session = Depends(get_db),
                           current_user=Depends(get_current_user_optional)):
    bill = billing_service.create_bill_with_items(db, dto, current_user)
    return ApiResponse(status=201, message="Bill created with its charges", data=bill)

