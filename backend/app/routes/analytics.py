from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import (
    RevenueSummary, VendorRevenueItem, ProductRevenueItem,
    MonthlyTrendItem, CategoryRevenueItem, RecentActivityItem, SalesOverviewPoint
)
from app.services.analytics_service import (
    get_revenue_summary, get_vendor_revenue, get_product_revenue,
    get_top_products, get_monthly_trend, get_category_revenue,
    get_recent_activity, get_sales_overview
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/recent-activity", response_model=List[RecentActivityItem])
def list_recent_activity(
    limit: int = Query(8, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Returns recent chronological marketplace activity timeline items.
    """
    return get_recent_activity(db, limit=limit)


@router.get("/sales-overview", response_model=List[SalesOverviewPoint])
def sales_overview_timeline(
    period: str = Query("6m", description="Period: 7d, 30d, or 6m"),
    db: Session = Depends(get_db)
):
    """
    Returns sales revenue trajectory data points for 7d, 30d, or 6m.
    """
    return get_sales_overview(db, period=period)


@router.get("/revenue", response_model=RevenueSummary)
def revenue_kpis(db: Session = Depends(get_db)):
    """
    Returns global KPI summary (Total Revenue, Orders, Units, AOV, Active Vendors, Low-Stock items).
    Includes zero-division guards for empty datasets.
    """
    return get_revenue_summary(db)


@router.get("/vendor-revenue", response_model=List[VendorRevenueItem])
def vendor_revenue_breakdown(db: Session = Depends(get_db)):
    """
    Returns total revenue, order count, and revenue share percentage per vendor.
    """
    return get_vendor_revenue(db)


@router.get("/product-revenue", response_model=List[ProductRevenueItem])
def product_revenue_breakdown(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Returns revenue and units sold performance for each product.
    """
    return get_product_revenue(db, limit=limit)


@router.get("/top-product", response_model=List[ProductRevenueItem])
def top_performing_products(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Returns the top-performing products ranked by total revenue.
    """
    return get_top_products(db, limit=limit)


@router.get("/monthly-trend", response_model=List[MonthlyTrendItem])
def monthly_sales_trend(db: Session = Depends(get_db)):
    """
    Returns monthly aggregated revenue and order counts over the past 6 months.
    """
    return get_monthly_trend(db)


@router.get("/category-revenue", response_model=List[CategoryRevenueItem])
def category_revenue_breakdown(db: Session = Depends(get_db)):
    """
    Returns revenue breakdown by product category with share percentage.
    """
    return get_category_revenue(db)
