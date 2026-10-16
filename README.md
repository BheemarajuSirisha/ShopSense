# 🏬 ShopSense – Multi-Vendor E-Commerce Analytics Platform
> **Milestone 1: Marketplace Foundation & Vendor Analytics**

ShopSense is an enterprise-grade multi-vendor e-commerce foundation and real-time financial analytics platform. Built with a modern decoupled architecture, it couples a high-performance **Python FastAPI** and **SQLAlchemy 2.0** backend persisted in **PostgreSQL** with a bespoke **React (Vite)** dashboard styled in the **"Plum Magenta Blush"** design system.

---

## 📸 Key Features & Capabilities

- **Marketplace Foundation**: Full relational multi-tenant vendor management, SKU catalog lifecycle, and automated warehouse inventory synchronization.
- **Deep Financial Analytics**: Real-time Gross Merchandise Value (GMV), unit velocities, monthly revenue trajectory (last 6 months), vendor revenue benchmarking, and category revenue share.
- **Live Inventory Health**: Intelligent low-stock detection (`current_stock <= reorder_level`) with visual progress bars, amber warning thresholds, and instant one-click restocking modal.
- **Strict Registration Validation**: Live client-side and server-side validation (`validate_vendor()`) with RFC-compliant email checking, phone digit verification, and duplicate-email conflict rejection.
- **Guaranteed Financial Consistency**: High-precision ledger calculations ensuring `sum(vendor_revenue) == total_platform_revenue == sum(product_revenue)` with zero-drift accuracy.
- **Zero Crash Resilience**: Division-by-zero guards on empty datasets and default fallback arrays across the entire React client.

---

## 🎨 Unique Design System – "Plum Magenta Blush"

ShopSense deliberately steps away from generic blue/purple SaaS templates in favor of a curated luxury palette:
- **Page Background**: Soft blush gradient (`#FDEFF6` → `#FBE4F0`)
- **Sidebar**: Deep plum gradient (`#4A0D3F` → `#7A1259`) with faint decorative wave lines at the bottom
- **Primary Magenta**: `#B5179E`
- **Primary Dark**: `#7A1259`
- **Accent Pink**: `#E14DB0`
- **Light Pink**: `#F8B4D9`
- **Pink Tint**: `#FCE4F1`
- **Card Borders**: 1px border `#F6D3E6`
- **Cards**: White (`#FFFFFF`), rounded-2xl, shadow `0 8px 24px rgba(181,23,158,0.08)`, hover lift
- **Typography**: *"Poppins"* (headings, numerals, and interface body)
- **Status Badges**:
  - Active / Delivered: Green on light green (`#15803D` on `#DCFCE7`)
  - Pending / Processing: Magenta on pink tint (`#B5179E` on `#FCE4F1`)
  - Shipped: Purple on lavender (`#7E22CE` on `#F3E8FF`)
  - Suspended / Cancelled: Red on light red (`#B91C1C` on `#FEE2E2`)
- **Charts**: Only magenta/pink shades (`#7A1259`, `#B5179E`, `#E14DB0`, `#F8B4D9`) with pink gradient area fills
- **Minimal Storefront Logo**: Custom SVG storefront logo with striped awning and small upward chart-spark, colored with the Plum Magenta Blush theme palette.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Frontend** | React 19 (Vite) | React Router v7, Recharts, Axios, Tailwind CSS v3, Framer Motion, react-hot-toast, Lucide Icons |
| **Backend** | Python 3.11+ / 3.13 | FastAPI, SQLAlchemy 2.0, Pydantic v2 (EmailStr), psycopg2-binary, python-dotenv, Uvicorn |
| **Database** | PostgreSQL 18 | Relational schema with Foreign Keys, Cascades, and Indexes |
| **Testing** | Pytest | TestClient, HTTPX, Parameterized Validation, Financial Consistency Ledger Tests |

---

## 📁 Project Structure

```
ShopSense/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application instance, CORS, routers & health checks
│   │   ├── database.py                 # SQLAlchemy 2.0 engine, SessionLocal, get_db() dependency
│   │   ├── models/                     # SQLAlchemy declarative ORM models
│   │   │   ├── __init__.py
│   │   │   ├── vendor.py               # Vendor entity (business_name, email unique, status)
│   │   │   ├── product.py              # Product entity (price, stock, vendor_id FK)
│   │   │   ├── inventory.py            # Inventory entity (current_stock, warehouse, reorder_level)
│   │   │   └── transaction.py          # Transaction entity (quantity, amount, transaction_date)
│   │   ├── schemas/                    # Pydantic v2 validation models
│   │   │   ├── __init__.py
│   │   │   ├── vendor.py               # VendorCreate, VendorUpdate, VendorResponse
│   │   │   ├── product.py              # ProductCreate, ProductUpdate, ProductResponse
│   │   │   ├── inventory.py            # InventoryUpdate, InventoryResponse
│   │   │   ├── transaction.py          # TransactionResponse
│   │   │   └── analytics.py            # RevenueSummary, VendorRevenueItem, ProductRevenueItem
│   │   ├── routes/                     # REST API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── vendors.py              # CRUD + status change (approve/activate/suspend)
│   │   │   ├── products.py             # CRUD + vendor existence validation
│   │   │   ├── inventory.py            # Low-stock detection + restock endpoints
│   │   │   ├── analytics.py            # KPIs, vendor shares, category donut, monthly trend
│   │   │   └── transactions.py         # Transaction ledger & sale recording
│   │   ├── services/                   # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── vendor_service.py       # validate_vendor() + vendor queries
│   │   │   ├── product_service.py      # Product CRUD + inventory provisioning
│   │   │   ├── inventory_service.py    # Stock level calculations
│   │   │   ├── analytics_service.py    # Zero-division guarded revenue aggregation
│   │   │   └── transaction_service.py  # Stock synchronization & ledger queries
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py              # Helper functions, timezone-aware UTC datetime
│   ├── create_tables.py                # Database table creator with model pre-imports
│   ├── seed_data.py                    # Idempotent seeder: 10 vendors, 50 products, 680+ transactions
│   ├── requirements.txt                # Pinned backend dependencies
│   ├── .env.example                    # Environment variable template
│   ├── .env                            # Active backend configuration
│   └── tests/                          # Pytest automated test suite
│       ├── __init__.py
│       ├── conftest.py                 # Test fixtures, TestClient, db session
│       ├── test_endpoints.py           # Integration tests for all REST endpoints
│       └── test_validation_and_consistency.py # >=99% validation accuracy & >=98% consistency proofs
├── frontend/
│   ├── public/
│   │   ├── logo.svg                    # ShopSense SVG logo
│   │   └── favicon.svg                 # Storefront with chart-spark favicon
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js                # Axios client with fallback URL & error toast interceptor
│   │   │   └── index.js                # Structured API service methods
│   │   ├── components/
│   │   │   ├── Badge.jsx               # Status and category pill badges
│   │   │   ├── EmptyState.jsx          # Illustrated zero-data fallback states
│   │   │   ├── Header.jsx              # Search, notification dot, avatar dropdown, date chip
│   │   │   ├── KPICard.jsx             # Metric counter with count-up animation & trend chip
│   │   │   ├── Layout.jsx              # Responsive shell & AI Assistant button
│   │   │   ├── Logo.jsx                # ShopSense storefront logo component
│   │   │   ├── Modal.jsx               # Accessible dialog container
│   │   │   ├── ProtectedRoute.jsx      # Auth check wrapper
│   │   │   ├── Sidebar.jsx             # Deep plum gradient drawer navigation & wave lines
│   │   │   └── SkeletonLoader.jsx      # Shimmer placeholder loaders
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication provider (Admin / Vendor roles)
│   │   ├── hooks/
│   │   │   └── useCountUp.js           # Animated numeral interpolation hook
│   │   └── pages/
│   │       ├── Dashboard.jsx           # Sales overview, donut chart, category bars, top products
│   │       ├── Vendors.jsx             # Vendor table, live validation modal & status actions
│   │       ├── Products.jsx            # Product catalog, grid/table toggle, CRUD modal
│   │       ├── Inventory.jsx           # Stock levels, progress bars, restock modal
│   │       ├── Analytics.jsx           # Comparative analytics & distribution charts
│   │       ├── Transactions.jsx        # Transaction ledger & CSV export
│   │       ├── Reports.jsx             # Audited financial statement downloads
│   │       ├── Settings.jsx            # Platform settings & infrastructure parameters
│   │       └── Login.jsx               # Access portal with quick-login buttons
│   ├── package.json
│   ├── tailwind.config.js              # Plum Magenta Blush palette & typography tokens
│   └── vite.config.js                  # Vite server & backend API proxy
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python 3.11+** or **Python 3.13**
- **Node.js 18+** & **npm**
- **PostgreSQL 18** running locally or via Docker

---

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create virtual environment (optional)
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure your environment variables
# Copy .env.example to .env and adjust credentials if needed
# Example: DATABASE_URL=postgresql://postgres:your_password@localhost:5432/shopIQ
```

#### Initialize Database & Tables
`create_tables.py` imports all models explicitly before calling `Base.metadata.create_all()` and will create the `shopIQ` database if it does not yet exist:
```bash
python create_tables.py
```

#### Seed Realistic Marketplace Data
`seed_data.py` is fully idempotent. It clears prior records and seeds 10 vendors, 50 catalog products, 50 warehouse inventory records, and 680+ transactions distributed across 6 months:
```bash
python seed_data.py
```

#### Run the FastAPI Backend Server
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive OpenAPI Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative Redoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
- Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

To validate the production bundle:
```bash
npm run build
```

---

## 🧪 Automated Testing & Consistency Proofs

ShopSense includes a comprehensive test suite executed with `pytest`:

```bash
# From workspace root
python -m pytest -v -s backend/tests/
```

### Test Suite Results

```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.1.1
collected 8 items

tests/test_endpoints.py::test_health_check PASSED                        [ 12%]
tests/test_endpoints.py::test_vendor_crud_and_duplicate_email PASSED     [ 25%]
tests/test_endpoints.py::test_product_crud_and_vendor_validation PASSED  [ 37%]
tests/test_endpoints.py::test_inventory_auto_provisioning PASSED        [ 50%]
tests/test_endpoints.py::test_analytics_endpoints_and_zero_division PASSED [ 62%]
tests/test_endpoints.py::test_transaction_recording_and_stock_decrement PASSED [ 75%]
tests/test_validation_and_consistency.py::test_vendor_registration_validation_matrix PASSED [ 87%]
tests/test_validation_and_consistency.py::test_financial_ledger_consistency_proof PASSED [100%]

======================== 8 passed in 0.54s =========================
```

### Mathematical Proof of Financial Consistency

$$\sum \text{vendor\_revenue} = \text{total\_revenue} = \sum \text{product\_revenue}$$

Every recorded transaction decrements warehouse stock and synchronizes vendor sales ledgers in strict ACID compliance without floating-point drift.

---

## 📊 Database Schema (Entity-Relationship)

```mermaid
erDiagram
    VENDORS ||--o{ PRODUCTS : supplies
    VENDORS ||--o{ TRANSACTIONS : receives
    PRODUCTS ||--|| INVENTORY : tracks
    PRODUCTS ||--o{ TRANSACTIONS : generates

    VENDORS {
        int vendor_id PK
        string business_name
        string owner_name
        string email UK
        string phone
        string category
        string status
        datetime created_at
    }

    PRODUCTS {
        int product_id PK
        string product_name
        string category
        float price
        int stock
        int vendor_id FK
    }

    INVENTORY {
        int inventory_id PK
        int product_id FK
        int current_stock
        string warehouse
        int reorder_level
    }

    TRANSACTIONS {
        int transaction_id PK
        int product_id FK
        int vendor_id FK
        int quantity
        float amount
        datetime transaction_date
    }
```

---

## 🔌 Core REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `DELETE` | `/products/{id}` | Deletes product and cascades to linked records |
| `GET` | `/inventory` | List stock levels with `low_stock=true` filter (`current_stock <= reorder_level`) |
| `PUT` | `/inventory/{id}` | Restock / adjust warehouse location or reorder threshold |
| `GET` | `/analytics/revenue` | High-level financial KPIs (GMV, total orders, units sold, AOV, low stock) |
| `GET` | `/analytics/vendor-revenue`| Vendor breakdown ranking with share percentages |
| `GET` | `/analytics/product-revenue`| Per-SKU velocity and revenue performance |
| `GET` | `/analytics/top-product` | Top 5 to 10 products ranked by gross revenue |
| `GET` | `/analytics/monthly-trend` | Monthly gross revenue and order counts over the past 6 months |
| `GET` | `/analytics/category-revenue`| Revenue breakdown by product category for donut charts |

---

## 🏛️ Database Architecture

```mermaid
erDiagram
    VENDORS ||--o{ PRODUCTS : "supplies"
    VENDORS ||--o{ TRANSACTIONS : "receives_revenue_from"
    PRODUCTS ||--|| INVENTORY : "tracked_in"
    PRODUCTS ||--o{ TRANSACTIONS : "purchased_in"

    VENDORS {
        int vendor_id PK
        string business_name
        string owner_name
        string email UK
        string phone
        string category
        string status
        datetime created_at
    }

    PRODUCTS {
        int product_id PK
        string product_name
        string category
        float price
        int stock
        int vendor_id FK
    }

    INVENTORY {
        int inventory_id PK
        int product_id FK,UK
        int current_stock
        string warehouse
        int reorder_level
    }

    TRANSACTIONS {
        int transaction_id PK
        int product_id FK
        int vendor_id FK
        int quantity
        float amount
        datetime transaction_date
    }
```

---

## 📜 License
Developed for the ShopSense E-Commerce Analytics Platform (Milestone 1). All rights reserved.
