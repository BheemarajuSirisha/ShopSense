from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.product_service import (
    create_product, get_products, get_product_by_id,
    update_product, delete_product
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def add_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """
    Creates a new product and creates a linked inventory record.
    Rejects creation if the referenced vendor ID does not exist.
    """
    try:
        return create_product(db, product_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": str(e)}
        )


@router.get("", response_model=List[ProductResponse])
def list_products(
    vendor_id: Optional[int] = Query(None, description="Filter by vendor ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieves all products with vendor details and current inventory levels.
    """
    return get_products(db, vendor_id=vendor_id, category=category, search=search, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductResponse)
def retrieve_product(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single product by ID.
    """
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def modify_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    """
    Updates product details and synchronizes inventory stock if updated.
    """
    try:
        updated = update_product(db, product_id, product_update)
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": str(e)}
        )


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def remove_product(product_id: int, db: Session = Depends(get_db)):
    """
    Deletes product and its corresponding inventory.
    """
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return {"message": f"Product {product_id} deleted successfully", "product_id": product_id}
