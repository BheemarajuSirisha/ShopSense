from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.services.transaction_service import (
    get_transactions, get_transaction_by_id, create_transaction,
    get_recent_transactions, count_transactions
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/recent", response_model=List[TransactionResponse])
def get_recent(
    limit: int = Query(8, ge=1, le=100, description="Number of recent transactions to fetch"),
    db: Session = Depends(get_db)
):
    """
    Read-only endpoint returning the latest transactions newest first,
    joined with vendor and product information. Returns [] safely when empty.
    """
    return get_recent_transactions(db, limit=limit)


@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    response: Response,
    vendor_id: Optional[int] = Query(None, description="Filter by vendor ID"),
    product_id: Optional[int] = Query(None, description="Filter by product ID"),
    search: Optional[str] = Query(None, description="Search by product or vendor name"),
    q: Optional[str] = Query(None, description="Search query alias for search"),
    from_: Optional[str] = Query(None, alias="from", description="Filter from date (YYYY-MM-DD or ISO)"),
    to_: Optional[str] = Query(None, alias="to", description="Filter to date (YYYY-MM-DD or ISO)"),
    page: Optional[int] = Query(None, ge=1, description="1-indexed page number"),
    skip: Optional[int] = Query(None, ge=0),
    limit: int = Query(10, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Retrieves chronological transaction logs with product and vendor metadata.
    Supports pagination, date range filtering, vendor filtering, and text search.
    """
    search_query = q if q is not None else search
    offset = skip if skip is not None else ((page - 1) * limit if page is not None else 0)

    total_count = count_transactions(
        db,
        vendor_id=vendor_id,
        product_id=product_id,
        search=search_query,
        from_date=from_,
        to_date=to_
    )
    total_pages = max(1, (total_count + limit - 1) // limit) if total_count > 0 else 1

    response.headers["X-Total-Count"] = str(total_count)
    response.headers["X-Total-Pages"] = str(total_pages)
    response.headers["Access-Control-Expose-Headers"] = "X-Total-Count, X-Total-Pages"

    return get_transactions(
        db,
        vendor_id=vendor_id,
        product_id=product_id,
        search=search_query,
        skip=offset,
        limit=limit,
        from_date=from_,
        to_date=to_
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def retrieve_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single transaction by ID.
    """
    txn = get_transaction_by_id(db, transaction_id)
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID {transaction_id} not found"
        )
    return txn


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def record_transaction(transaction_in: TransactionCreate, db: Session = Depends(get_db)):
    """
    Records a new transaction and decrements product inventory.
    Validates product and vendor existence and relationship.
    """
    try:
        return create_transaction(db, transaction_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(e)}
        )
