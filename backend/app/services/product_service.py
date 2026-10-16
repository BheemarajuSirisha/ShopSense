from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from app.models.product import Product
from app.models.vendor import Vendor
from app.models.inventory import Inventory
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, product_in: ProductCreate) -> Dict[str, Any]:
    """
    Creates a new product and initializes its corresponding inventory record.
    Validates that the specified vendor exists.
    """
    # Check if vendor exists
    vendor_stmt = select(Vendor).where(Vendor.vendor_id == product_in.vendor_id)
    vendor = db.execute(vendor_stmt).scalars().first()
    if not vendor:
        raise ValueError(f"Vendor with ID {product_in.vendor_id} does not exist")

    # Create Product
    product = Product(
        product_name=product_in.product_name.strip(),
        category=product_in.category.strip(),
        price=round(float(product_in.price), 2),
        stock=int(product_in.stock),
        vendor_id=product_in.vendor_id,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # Automatically create Inventory record
    inventory = Inventory(
        product_id=product.product_id,
        current_stock=product.stock,
        warehouse=(product_in.warehouse or "Central Warehouse").strip(),
        reorder_level=int(product_in.reorder_level or 15),
    )
    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return {
        "product_id": product.product_id,
        "product_name": product.product_name,
        "category": product.category,
        "price": product.price,
        "stock": product.stock,
        "vendor_id": product.vendor_id,
        "vendor_name": vendor.business_name,
        "warehouse": inventory.warehouse,
        "reorder_level": inventory.reorder_level,
    }


def get_products(
    db: Session,
    vendor_id: Optional[int] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Fetches products with vendor details and inventory levels.
    """
    query = (
        select(Product, Vendor.business_name.label("vendor_name"), Inventory.warehouse, Inventory.reorder_level)
        .join(Vendor, Product.vendor_id == Vendor.vendor_id)
        .outerjoin(Inventory, Product.product_id == Inventory.product_id)
    )

    if vendor_id:
        query = query.where(Product.vendor_id == vendor_id)

    if category and category != "all":
        query = query.where(func.lower(Product.category) == category.strip().lower())

    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(Product.product_name).like(search_term),
                func.lower(Product.category).like(search_term),
                func.lower(Vendor.business_name).like(search_term),
            )
        )

    query = query.order_by(Product.product_id.desc()).offset(skip).limit(limit)
    rows = db.execute(query).all()

    results = []
    for prod, vendor_name, warehouse, reorder_level in rows:
        results.append({
            "product_id": prod.product_id,
            "product_name": prod.product_name,
            "category": prod.category,
            "price": prod.price,
            "stock": prod.stock,
            "vendor_id": prod.vendor_id,
            "vendor_name": vendor_name,
            "warehouse": warehouse or "Central Warehouse",
            "reorder_level": reorder_level if reorder_level is not None else 15,
        })

    return results


def get_product_by_id(db: Session, product_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches a single product by ID with vendor details.
    """
    stmt = (
        select(Product, Vendor.business_name.label("vendor_name"), Inventory.warehouse, Inventory.reorder_level)
        .join(Vendor, Product.vendor_id == Vendor.vendor_id)
        .outerjoin(Inventory, Product.product_id == Inventory.product_id)
        .where(Product.product_id == product_id)
    )
    row = db.execute(stmt).first()
    if not row:
        return None

    prod, vendor_name, warehouse, reorder_level = row
    return {
        "product_id": prod.product_id,
        "product_name": prod.product_name,
        "category": prod.category,
        "price": prod.price,
        "stock": prod.stock,
        "vendor_id": prod.vendor_id,
        "vendor_name": vendor_name,
        "warehouse": warehouse or "Central Warehouse",
        "reorder_level": reorder_level if reorder_level is not None else 15,
    }


def update_product(db: Session, product_id: int, product_update: ProductUpdate) -> Optional[Dict[str, Any]]:
    """
    Updates product details and syncs inventory stock if stock was updated.
    """
    stmt = select(Product).where(Product.product_id == product_id)
    product = db.execute(stmt).scalars().first()
    if not product:
        return None

    data = product_update.model_dump(exclude_unset=True)

    if "vendor_id" in data and data["vendor_id"]:
        vendor_stmt = select(Vendor).where(Vendor.vendor_id == data["vendor_id"])
        vendor = db.execute(vendor_stmt).scalars().first()
        if not vendor:
            raise ValueError(f"Vendor with ID {data['vendor_id']} does not exist")
        product.vendor_id = data["vendor_id"]

    for field, val in data.items():
        if field != "vendor_id" and val is not None:
            setattr(product, field, val.strip() if isinstance(val, str) else val)

    # Sync inventory stock
    if "stock" in data and data["stock"] is not None:
        inv_stmt = select(Inventory).where(Inventory.product_id == product_id)
        inventory = db.execute(inv_stmt).scalars().first()
        if inventory:
            inventory.current_stock = int(data["stock"])

    db.commit()
    db.refresh(product)
    return get_product_by_id(db, product_id)


def delete_product(db: Session, product_id: int) -> bool:
    """
    Deletes product by ID (cascades to inventory and transactions).
    """
    stmt = select(Product).where(Product.product_id == product_id)
    product = db.execute(stmt).scalars().first()
    if not product:
        return False

    db.delete(product)
    db.commit()
    return True
