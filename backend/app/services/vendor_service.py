import re
from typing import Tuple, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.transaction import Transaction
from app.schemas.vendor import VendorCreate, VendorUpdate

# Comprehensive email regex RFC 5322 compliant subset
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

VALID_STATUSES = {"pending", "active", "suspended"}


def validate_vendor(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates vendor registration payload with high precision.
    Returns (is_valid: bool, error_messages: List[str]).
    """
    errors: List[str] = []

    if not isinstance(data, dict):
        return False, ["Payload must be a dictionary"]

    # 1. Business Name
    business_name = data.get("business_name")
    if not business_name or not str(business_name).strip():
        errors.append("Business name is required and cannot be empty")
    elif len(str(business_name).strip()) < 2:
        errors.append("Business name must be at least 2 characters long")
    elif len(str(business_name).strip()) > 150:
        errors.append("Business name cannot exceed 150 characters")

    # 2. Owner Name
    owner_name = data.get("owner_name")
    if not owner_name or not str(owner_name).strip():
        errors.append("Owner name is required and cannot be empty")
    elif len(str(owner_name).strip()) < 2:
        errors.append("Owner name must be at least 2 characters long")
    elif len(str(owner_name).strip()) > 100:
        errors.append("Owner name cannot exceed 100 characters")

    # 3. Email
    email = data.get("email")
    if not email or not str(email).strip():
        errors.append("Email address is required")
    else:
        email_clean = str(email).strip().lower()
        if len(email_clean) > 120:
            errors.append("Email address cannot exceed 120 characters")
        elif not EMAIL_REGEX.match(email_clean):
            errors.append("Invalid email address format")
        elif ".." in email_clean or email_clean.startswith(".") or email_clean.endswith("."):
            errors.append("Invalid email address format (dots placement)")

    # 4. Phone
    phone = data.get("phone")
    if not phone or not str(phone).strip():
        errors.append("Phone number is required")
    else:
        phone_clean = str(phone).strip()
        digits = re.sub(r"\D", "", phone_clean)
        if len(digits) < 7 or len(digits) > 15:
            errors.append("Phone number must contain between 7 and 15 digits")

    # 5. Category
    category = data.get("category")
    if not category or not str(category).strip():
        errors.append("Category is required")
    elif len(str(category).strip()) < 2:
        errors.append("Category must be at least 2 characters long")
    elif len(str(category).strip()) > 50:
        errors.append("Category cannot exceed 50 characters")

    # 6. Status (optional during registration, but must be valid if given)
    status = data.get("status")
    if status is not None:
        status_clean = str(status).strip().lower()
        if status_clean not in VALID_STATUSES:
            errors.append(f"Invalid status '{status}'. Must be one of: {', '.join(sorted(VALID_STATUSES))}")

    return (len(errors) == 0, errors)


def create_vendor(db: Session, vendor_in: VendorCreate) -> Vendor:
    """
    Creates a new vendor in the database after uniqueness validation.
    """
    clean_email = vendor_in.email.strip().lower()

    # Check for duplicate email
    stmt = select(Vendor).where(func.lower(Vendor.email) == clean_email)
    existing = db.execute(stmt).scalars().first()
    if existing:
        raise ValueError(f"Vendor with email '{clean_email}' already exists")

    new_vendor = Vendor(
        business_name=vendor_in.business_name.strip(),
        owner_name=vendor_in.owner_name.strip(),
        email=clean_email,
        phone=vendor_in.phone.strip(),
        category=vendor_in.category.strip(),
        status=vendor_in.status if vendor_in.status in VALID_STATUSES else "active",
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor


def get_vendors(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """
    Fetches vendors with optional search, category, status filters,
    along with product count and total revenue.
    """
    query = select(Vendor)

    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(Vendor.business_name).like(search_term),
                func.lower(Vendor.owner_name).like(search_term),
                func.lower(Vendor.email).like(search_term),
            )
        )

    if category and category != "all":
        query = query.where(func.lower(Vendor.category) == category.strip().lower())

    if status and status != "all":
        query = query.where(func.lower(Vendor.status) == status.strip().lower())

    query = query.order_by(Vendor.vendor_id.desc()).offset(skip).limit(limit)
    vendors = db.execute(query).scalars().all()

    # Pre-fetch counts and revenue for efficiency
    vendor_ids = [v.vendor_id for v in vendors]
    if not vendor_ids:
        return []

    # Product counts
    prod_stmt = (
        select(Product.vendor_id, func.count(Product.product_id).label("count"))
        .where(Product.vendor_id.in_(vendor_ids))
        .group_by(Product.vendor_id)
    )
    prod_counts = dict(db.execute(prod_stmt).all())

    # Revenue totals
    rev_stmt = (
        select(Transaction.vendor_id, func.coalesce(func.sum(Transaction.amount), 0.0).label("revenue"))
        .where(Transaction.vendor_id.in_(vendor_ids))
        .group_by(Transaction.vendor_id)
    )
    rev_totals = dict(db.execute(rev_stmt).all())

    results = []
    for v in vendors:
        results.append({
            "vendor_id": v.vendor_id,
            "business_name": v.business_name,
            "owner_name": v.owner_name,
            "email": v.email,
            "phone": v.phone,
            "category": v.category,
            "status": v.status,
            "created_at": v.created_at,
            "products_count": prod_counts.get(v.vendor_id, 0),
            "total_revenue": round(float(rev_totals.get(v.vendor_id, 0.0)), 2),
        })

    return results


def get_vendor_by_id(db: Session, vendor_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetches a single vendor by ID with product count and total revenue.
    """
    stmt = select(Vendor).where(Vendor.vendor_id == vendor_id)
    vendor = db.execute(stmt).scalars().first()
    if not vendor:
        return None

    prod_count_stmt = select(func.count(Product.product_id)).where(Product.vendor_id == vendor_id)
    prod_count = db.execute(prod_count_stmt).scalar() or 0

    rev_stmt = select(func.coalesce(func.sum(Transaction.amount), 0.0)).where(Transaction.vendor_id == vendor_id)
    total_rev = db.execute(rev_stmt).scalar() or 0.0

    return {
        "vendor_id": vendor.vendor_id,
        "business_name": vendor.business_name,
        "owner_name": vendor.owner_name,
        "email": vendor.email,
        "phone": vendor.phone,
        "category": vendor.category,
        "status": vendor.status,
        "created_at": vendor.created_at,
        "products_count": prod_count,
        "total_revenue": round(float(total_rev), 2),
    }


def update_vendor(db: Session, vendor_id: int, vendor_update: VendorUpdate) -> Optional[Vendor]:
    """
    Updates vendor information.
    """
    stmt = select(Vendor).where(Vendor.vendor_id == vendor_id)
    vendor = db.execute(stmt).scalars().first()
    if not vendor:
        return None

    update_data = vendor_update.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"]:
        new_email = update_data["email"].strip().lower()
        if new_email != vendor.email.lower():
            dup_stmt = select(Vendor).where(func.lower(Vendor.email) == new_email)
            if db.execute(dup_stmt).scalars().first():
                raise ValueError(f"Vendor with email '{new_email}' already exists")
            vendor.email = new_email

    for field, val in update_data.items():
        if field != "email" and val is not None:
            setattr(vendor, field, val.strip() if isinstance(val, str) else val)

    db.commit()
    db.refresh(vendor)
    return vendor


def update_vendor_status(db: Session, vendor_id: int, status: str) -> Optional[Vendor]:
    """
    Updates vendor status (e.g., active, suspended, pending).
    """
    status_clean = status.strip().lower()
    if status_clean not in VALID_STATUSES:
        raise ValueError(f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}")

    stmt = select(Vendor).where(Vendor.vendor_id == vendor_id)
    vendor = db.execute(stmt).scalars().first()
    if not vendor:
        return None

    vendor.status = status_clean
    db.commit()
    db.refresh(vendor)
    return vendor
