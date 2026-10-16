from app.routes.vendors import router as vendors_router
from app.routes.products import router as products_router
from app.routes.inventory import router as inventory_router
from app.routes.analytics import router as analytics_router
from app.routes.transactions import router as transactions_router

__all__ = [
    "vendors_router",
    "products_router",
    "inventory_router",
    "analytics_router",
    "transactions_router"
]
