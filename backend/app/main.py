import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import check_db_connection
from app.routes.vendors import router as vendors_router
from app.routes.products import router as products_router
from app.routes.inventory import router as inventory_router
from app.routes.analytics import router as analytics_router
from app.routes.transactions import router as transactions_router

app = FastAPI(
    title="ShopSense API – Multi-Vendor E-Commerce Analytics Platform",
    description="Production-grade RESTful API for Multi-Vendor E-Commerce marketplace foundation and financial analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# Allow additional origins from environment if specified
extra_origins = os.getenv("CORS_ORIGINS", "")
if extra_origins:
    origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(vendors_router)
app.include_router(products_router)
app.include_router(inventory_router)
app.include_router(analytics_router)
app.include_router(transactions_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "platform": "ShopSense – Multi-Vendor E-Commerce Analytics Platform",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "database_connected": check_db_connection(),
    }


@app.get("/health", tags=["Health"])
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "database_disconnected",
        "database": "connected" if db_ok else "error",
    }
