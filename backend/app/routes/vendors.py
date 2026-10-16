from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorStatusUpdate, VendorResponse
from app.services.vendor_service import (
    validate_vendor, create_vendor, get_vendors, get_vendor_by_id,
    update_vendor, update_vendor_status
)

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def register_vendor(vendor_in: VendorCreate, db: Session = Depends(get_db)):
    """
    Registers a new vendor with strict validation and duplicate email rejection.
    """
    # Service validation
    payload = vendor_in.model_dump()
    is_valid, errors = validate_vendor(payload)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Validation failed", "errors": errors}
        )

    try:
        new_vendor = create_vendor(db, vendor_in)
        return get_vendor_by_id(db, new_vendor.vendor_id)
    except ValueError as e:
        # Duplicate email
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": str(e)}
        )


@router.get("", response_model=List[VendorResponse])
def list_vendors(
    search: Optional[str] = Query(None, description="Search by name or email"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status (pending, active, suspended)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieves vendors with optional search, category, status filters, and revenue metrics.
    """
    return get_vendors(db, search=search, category=category, status=status, skip=skip, limit=limit)


@router.get("/{vendor_id}", response_model=VendorResponse)
def retrieve_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single vendor by ID with detailed product count and revenue.
    """
    vendor = get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with ID {vendor_id} not found"
        )
    return vendor


@router.put("/{vendor_id}", response_model=VendorResponse)
def modify_vendor(vendor_id: int, vendor_update: VendorUpdate, db: Session = Depends(get_db)):
    """
    Updates vendor information.
    """
    try:
        vendor = update_vendor(db, vendor_id, vendor_update)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID {vendor_id} not found"
            )
        return get_vendor_by_id(db, vendor_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": str(e)}
        )


@router.patch("/{vendor_id}/status", response_model=VendorResponse)
def change_vendor_status(vendor_id: int, status_update: VendorStatusUpdate, db: Session = Depends(get_db)):
    """
    Updates vendor status: 'active', 'pending', or 'suspended'.
    """
    try:
        vendor = update_vendor_status(db, vendor_id, status_update.status)
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vendor with ID {vendor_id} not found"
            )
        return get_vendor_by_id(db, vendor_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)}
        )
