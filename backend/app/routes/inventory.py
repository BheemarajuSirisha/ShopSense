from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.inventory import InventoryResponse, InventoryUpdate
from app.services.inventory_service import get_inventory, update_inventory

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=List[InventoryResponse])
def list_inventory(
    warehouse: Optional[str] = Query(None, description="Filter by warehouse location"),
    low_stock: bool = Query(False, description="Filter to only low-stock items (stock <= reorder_level)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieves inventory levels across products, with low-stock detection.
    """
    return get_inventory(db, warehouse=warehouse, low_stock_only=low_stock, skip=skip, limit=limit)


@router.put("/{inventory_id}", response_model=InventoryResponse)
def modify_inventory(
    inventory_id: int,
    inv_update: InventoryUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates stock level, warehouse, or reorder threshold for an inventory item.
    """
    updated = update_inventory(db, inventory_id, inv_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inventory record with ID {inventory_id} not found"
        )
    return updated
