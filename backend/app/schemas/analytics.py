from typing import Optional
from pydantic import BaseModel, ConfigDict


class RevenueSummary(BaseModel):
    total_revenue: float = 0.0
    total_orders: int = 0
    total_units_sold: int = 0
    average_order_value: float = 0.0
    active_vendors_count: int = 0
    low_stock_items_count: int = 0
    total_products_count: Optional[int] = 0
    revenue_growth_pct: Optional[float] = 0.0
    orders_growth_pct: Optional[float] = 0.0
    vendors_growth_pct: Optional[float] = 0.0
    products_growth_pct: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)


class VendorRevenueItem(BaseModel):
    vendor_id: int
    business_name: str
    category: str
    status: str
    total_revenue: float
    orders_count: int
    share_percentage: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class ProductRevenueItem(BaseModel):
    product_id: int
    product_name: str
    category: str
    vendor_id: int
    vendor_name: str
    price: float
    current_stock: int
    units_sold: int
    total_revenue: float

    model_config = ConfigDict(from_attributes=True)


class MonthlyTrendItem(BaseModel):
    month_key: str  # e.g., "2026-05"
    month_label: str  # e.g., "May 2026"
    revenue: float
    orders: int
    units: int

    model_config = ConfigDict(from_attributes=True)


class CategoryRevenueItem(BaseModel):
    category: str
    total_revenue: float
    orders_count: int
    percentage: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class RecentActivityItem(BaseModel):
    id: str
    type: str  # "order", "vendor", "inventory"
    title: str
    description: str
    timestamp: str
    time_ago: str
    status: str
    amount: Optional[float] = None
    dot_color: str

    model_config = ConfigDict(from_attributes=True)


class SalesOverviewPoint(BaseModel):
    date_label: str
    revenue: float
    orders: int

    model_config = ConfigDict(from_attributes=True)
