from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.vendor import Vendor
from app.schemas.inventory import InventoryUpdate


def get_inventory(
    db: Session,
    warehouse: Optional[str] = None,
    low_stock_only: bool = False,
    skip: int = 0,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Fetches inventory records with product & vendor names and low-stock flag.
    Low-stock is defined as current_stock <= reorder_level.
    """
    query = (
        select(
            Inventory,
            Product.product_name,
            Product.category,
            Product.price,
            Product.vendor_id,
            Vendor.business_name.label("vendor_name"),
        )
        .join(Product, Inventory.product_id == Product.product_id)
        .join(Vendor, Product.vendor_id == Vendor.vendor_id)
    )

    if warehouse and warehouse != "all":
        query = query.where(func.lower(Inventory.warehouse) == warehouse.strip().lower())

    if low_stock_only:
        query = query.where(Inventory.current_stock <= Inventory.reorder_level)

    query = query.order_by(Inventory.current_stock.asc()).offset(skip).limit(limit)
    rows = db.execute(query).all()

    results = []
    for inv, prod_name, cat, price, vendor_id, vendor_name in rows:
        is_low = inv.current_stock <= inv.reorder_level
        results.append({
            "inventory_id": inv.inventory_id,
            "product_id": inv.product_id,
            "product_name": prod_name,
            "category": cat,
            "price": price,
            "vendor_id": vendor_id,
            "vendor_name": vendor_name,
            "current_stock": inv.current_stock,
            "warehouse": inv.warehouse,
            "reorder_level": inv.reorder_level,
            "is_low_stock": is_low,
        })

    return results


def update_inventory(
    db: Session, inventory_id: int, inv_update: InventoryUpdate
) -> Optional[Dict[str, Any]]:
    """
    Updates inventory stock, warehouse, or reorder level,
    and synchronizes Product.stock.
    """
    stmt = select(Inventory).where(Inventory.inventory_id == inventory_id)
    inv = db.execute(stmt).scalars().first()
    if not inv:
        return None

    data = inv_update.model_dump(exclude_unset=True)

    if "current_stock" in data and data["current_stock"] is not None:
        inv.current_stock = int(data["current_stock"])
        # Also sync product stock
        prod_stmt = select(Product).where(Product.product_id == inv.product_id)
        product = db.execute(prod_stmt).scalars().first()
        if product:
            product.stock = inv.current_stock

    if "warehouse" in data and data["warehouse"]:
        inv.warehouse = data["warehouse"].strip()

    if "reorder_level" in data and data["reorder_level"] is not None:
        inv.reorder_level = int(data["reorder_level"])

    db.commit()
    db.refresh(inv)

    # Fetch updated details
    prod_stmt = (
        select(Product.product_name, Product.category, Product.price, Product.vendor_id, Vendor.business_name)
        .join(Vendor, Product.vendor_id == Vendor.vendor_id)
        .where(Product.product_id == inv.product_id)
    )
    prod_row = db.execute(prod_stmt).first()
    prod_name, cat, price, vendor_id, vendor_name = prod_row if prod_row else ("", "", 0.0, 0, "")

    return {
        "inventory_id": inv.inventory_id,
        "product_id": inv.product_id,
        "product_name": prod_name,
        "category": cat,
        "price": price,
        "vendor_id": vendor_id,
        "vendor_name": vendor_name,
        "current_stock": inv.current_stock,
        "warehouse": inv.warehouse,
        "reorder_level": inv.reorder_level,
        "is_low_stock": inv.current_stock <= inv.reorder_level,
    }


def get_low_stock_count(db: Session) -> int:
    """
    Returns count of items where current_stock <= reorder_level.
    """
    stmt = select(func.count(Inventory.inventory_id)).where(
        Inventory.current_stock <= Inventory.reorder_level
    )
    return db.execute(stmt).scalar() or 0
