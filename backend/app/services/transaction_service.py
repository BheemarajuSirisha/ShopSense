from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from app.models.transaction import Transaction
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.inventory import Inventory
from app.schemas.transaction import TransactionCreate
from app.utils.helpers import utc_now


def parse_date_filter(val: Optional[str], is_end_of_day: bool = False) -> Optional[Any]:
    if not val or not str(val).strip():
        return None
    val_str = str(val).strip()
    try:
        if len(val_str) == 10 and val_str.count("-") == 2:
            dt = datetime.strptime(val_str, "%Y-%m-%d")
            if is_end_of_day:
                dt = dt.replace(hour=23, minute=59, second=59, microsecond=999999)
            return dt.replace(tzinfo=timezone.utc)
        dt = datetime.fromisoformat(val_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def get_transactions(
    db: Session,
    vendor_id: Optional[int] = None,
    product_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieves transactions joined with Product and Vendor details.
    Ordered in descending order by transaction timestamp.
    """
    query = (
        select(
            Transaction,
            Product.product_name,
            Vendor.business_name.label("vendor_name")
        )
        .join(Product, Transaction.product_id == Product.product_id)
        .join(Vendor, Transaction.vendor_id == Vendor.vendor_id)
    )

    if vendor_id:
        query = query.where(Transaction.vendor_id == vendor_id)

    if product_id:
        query = query.where(Transaction.product_id == product_id)

    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(Product.product_name).like(search_pattern),
                func.lower(Vendor.business_name).like(search_pattern)
            )
        )

    start_dt = parse_date_filter(from_date, is_end_of_day=False)
    if start_dt:
        query = query.where(Transaction.transaction_date >= start_dt)

    end_dt = parse_date_filter(to_date, is_end_of_day=True)
    if end_dt:
        query = query.where(Transaction.transaction_date <= end_dt)

    query = query.order_by(Transaction.transaction_date.desc(), Transaction.transaction_id.desc()).offset(skip).limit(limit)
    rows = db.execute(query).all()

    results = []
    for txn, prod_name, vend_name in rows:
        results.append({
            "transaction_id": txn.transaction_id,
            "product_id": txn.product_id,
            "vendor_id": txn.vendor_id,
            "quantity": txn.quantity,
            "amount": float(txn.amount),
            "transaction_date": txn.transaction_date,
            "product_name": prod_name,
            "vendor_name": vend_name,
        })

    return results


def count_transactions(
    db: Session,
    vendor_id: Optional[int] = None,
    product_id: Optional[int] = None,
    search: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
) -> int:
    """
    Counts total transactions matching filters.
    """
    query = (
        select(func.count(Transaction.transaction_id))
        .join(Product, Transaction.product_id == Product.product_id)
        .join(Vendor, Transaction.vendor_id == Vendor.vendor_id)
    )

    if vendor_id:
        query = query.where(Transaction.vendor_id == vendor_id)

    if product_id:
        query = query.where(Transaction.product_id == product_id)

    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(Product.product_name).like(search_pattern),
                func.lower(Vendor.business_name).like(search_pattern)
            )
        )

    start_dt = parse_date_filter(from_date, is_end_of_day=False)
    if start_dt:
        query = query.where(Transaction.transaction_date >= start_dt)

    end_dt = parse_date_filter(to_date, is_end_of_day=True)
    if end_dt:
        query = query.where(Transaction.transaction_date <= end_dt)

    return db.execute(query).scalar() or 0


def get_recent_transactions(db: Session, limit: int = 8) -> List[Dict[str, Any]]:
    """
    Read-only helper returning the latest transactions newest first.
    """
    return get_transactions(db, skip=0, limit=limit)



def get_transaction_by_id(db: Session, transaction_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single transaction by ID with associated product and vendor names.
    """
    query = (
        select(
            Transaction,
            Product.product_name,
            Vendor.business_name.label("vendor_name")
        )
        .join(Product, Transaction.product_id == Product.product_id)
        .join(Vendor, Transaction.vendor_id == Vendor.vendor_id)
        .where(Transaction.transaction_id == transaction_id)
    )
    row = db.execute(query).first()
    if not row:
        return None

    txn, prod_name, vend_name = row
    return {
        "transaction_id": txn.transaction_id,
        "product_id": txn.product_id,
        "vendor_id": txn.vendor_id,
        "quantity": txn.quantity,
        "amount": float(txn.amount),
        "transaction_date": txn.transaction_date,
        "product_name": prod_name,
        "vendor_name": vend_name,
    }


def create_transaction(db: Session, transaction_in: TransactionCreate) -> Dict[str, Any]:
    """
    Creates a new transaction, validating product and vendor existence.
    Automatically decrements warehouse inventory and product stock.
    """
    # 1. Validate Product
    product = db.execute(
        select(Product).where(Product.product_id == transaction_in.product_id)
    ).scalar_one_or_none()
    if not product:
        raise ValueError(f"Product with ID {transaction_in.product_id} does not exist")

    # 2. Validate Vendor
    vendor = db.execute(
        select(Vendor).where(Vendor.vendor_id == transaction_in.vendor_id)
    ).scalar_one_or_none()
    if not vendor:
        raise ValueError(f"Vendor with ID {transaction_in.vendor_id} does not exist")

    # 3. Check Vendor ownership
    if product.vendor_id != transaction_in.vendor_id:
        raise ValueError(
            f"Product '{product.product_name}' belongs to vendor ID {product.vendor_id}, "
            f"not vendor ID {transaction_in.vendor_id}"
        )

    # 4. Calculate amount if omitted
    amount = transaction_in.amount
    if amount is None or amount <= 0:
        amount = round(float(product.price) * transaction_in.quantity, 2)

    # 5. Decrement warehouse stock if inventory exists
    inv = db.execute(
        select(Inventory).where(Inventory.product_id == product.product_id)
    ).scalar_one_or_none()
    if inv:
        inv.current_stock = max(0, inv.current_stock - transaction_in.quantity)

    product.stock = max(0, product.stock - transaction_in.quantity)

    # 6. Create Transaction
    txn = Transaction(
        product_id=transaction_in.product_id,
        vendor_id=transaction_in.vendor_id,
        quantity=transaction_in.quantity,
        amount=amount,
        transaction_date=transaction_in.transaction_date or utc_now()
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)

    return {
        "transaction_id": txn.transaction_id,
        "product_id": txn.product_id,
        "vendor_id": txn.vendor_id,
        "quantity": txn.quantity,
        "amount": float(txn.amount),
        "transaction_date": txn.transaction_date,
        "product_name": product.product_name,
        "vendor_name": vendor.business_name,
    }
