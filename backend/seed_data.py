import os
import sys
import random

# Configure UTF-8 encoding for Windows stdout/stderr
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from sqlalchemy import text

# Load .env
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or not DATABASE_URL.strip():
    err_msg = (
        "❌ CONFIGURATION ERROR: 'DATABASE_URL' is missing or empty in backend/.env!\n"
        "Please specify DATABASE_URL in backend/.env, for example:\n"
        "DATABASE_URL=postgresql://postgres:your_password@localhost:5432/shopIQ"
    )
    print(err_msg, file=sys.stderr)
    raise ValueError(err_msg)

from app.database import SessionLocal, engine, explain_db_error
from app.models.vendor import Vendor
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.transaction import Transaction

# Deterministic seed for reproducible tests
random.seed(42)

VENDORS_DATA = [
    {
        "business_name": "Aura Fine Jewelry",
        "owner_name": "Elena Rostova",
        "email": "elena@aurajewelry.com",
        "phone": "+1 415 882 1042",
        "category": "Jewelry & Luxury",
        "status": "active",
        "products": [
            ("18k Gold Vermeil Choker", 320.00, 45, 15),
            ("Diamond Pavé Teardrop Earrings", 850.00, 18, 15),
            ("Solitaire Moissanite Ring", 1150.00, 8, 15),     # Low stock
            ("Handcrafted Pearl Cuff Bracelet", 240.00, 32, 15),
            ("Hammered Gold Signet Band", 195.00, 12, 15),    # Low stock
        ]
    },
    {
        "business_name": "Luxe Leather Goods",
        "owner_name": "Marco Valenti",
        "email": "marco@luxeleather.it",
        "phone": "+1 212 993 4510",
        "category": "Accessories",
        "status": "active",
        "products": [
            ("Tuscan Calfskin Messenger Bag", 480.00, 25, 15),
            ("Suede Trim Weekend Duffle", 620.00, 14, 15),     # Low stock
            ("Hand-Stitched Bifold Wallet", 110.00, 60, 15),
            ("Minimalist Leather Cardholder", 65.00, 85, 15),
            ("Brass Buckle Saddle Belt", 145.00, 38, 15),
        ]
    },
    {
        "business_name": "Velvet & Vine Organics",
        "owner_name": "Sophia Chen",
        "email": "sophia@velvetvine.com",
        "phone": "+1 503 661 7890",
        "category": "Gourmet & Beverage",
        "status": "active",
        "products": [
            ("Reserve Biodynamic Pinot Noir 2021", 85.00, 50, 15),
            ("Cold-Pressed Truffle Infused Olive Oil", 42.00, 9, 15), # Low stock
            ("Artisan Aged Balsamic Modena (12yr)", 58.00, 40, 15),
            ("Wildflower Raw Honey Sampler", 34.00, 75, 15),
            ("Single-Estate Matcha Green Tea", 48.00, 55, 15),
        ]
    },
    {
        "business_name": "Artisan Home Crafts",
        "owner_name": "Liam O'Connor",
        "email": "liam@artisancrafts.co",
        "phone": "+1 312 447 8820",
        "category": "Home & Living",
        "status": "active",
        "products": [
            ("Hand-Turned Walnut Salad Bowl", 165.00, 20, 15),
            ("Ceramic Stoneware Dining Set (16pc)", 380.00, 10, 15), # Low stock
            ("Linen Hemstitch Table Runner", 55.00, 65, 15),
            ("Mouth-Blown Amber Carafe & Tumblers", 95.00, 30, 15),
            ("Hand-Woven Moroccan Wool Throw", 210.00, 16, 15),
        ]
    },
    {
        "business_name": "Saffron Silk Textiles",
        "owner_name": "Priya Sharma",
        "email": "priya@saffronsilk.in",
        "phone": "+1 408 552 9130",
        "category": "Fashion & Apparel",
        "status": "active",
        "products": [
            ("Mulberry Silk Kimono Robe", 260.00, 28, 15),
            ("Hand-Dyed Kashmiri Cashmere Scarf", 190.00, 35, 15),
            ("Embroidered Velvet Cushion Cover", 75.00, 48, 15),
            ("Organic Cotton Loungewear Set", 130.00, 6, 15),   # Low stock
            ("Silk Crepe de Chine Evening Shawl", 175.00, 22, 15),
        ]
    },
    {
        "business_name": "Heritage Coffee Roasters",
        "owner_name": "Mateo Alvarez",
        "email": "mateo@heritagecoffee.com",
        "phone": "+1 206 558 3192",
        "category": "Gourmet & Beverage",
        "status": "active",
        "products": [
            ("Ethiopian Yirgacheffe Washed Beans (1kg)", 38.00, 110, 15),
            ("Geisha Special Reserve Peaberry (250g)", 68.00, 15, 15), # At threshold
            ("Bourbon Barrel-Aged Espresso Roast", 44.00, 70, 15),
            ("Ceramic Conical Burr Hand Grinder", 89.00, 34, 15),
            ("Heritage Double-Wall Pour-Over Dripper", 54.00, 42, 15),
        ]
    },
    {
        "business_name": "Glow Botanicals",
        "owner_name": "Chloe Dupont",
        "email": "chloe@glowbotanicals.fr",
        "phone": "+1 646 771 9024",
        "category": "Beauty & Wellness",
        "status": "active",
        "products": [
            ("Rosehip & Squalane Radiance Face Oil", 72.00, 62, 15),
            ("Bakuchiol Retinol-Alternative Serum", 84.00, 40, 15),
            ("Botanical AHA Exfoliating Toner", 46.00, 50, 15),
            ("Whipped Shea & Jasmine Body Soufflé", 52.00, 11, 15), # Low stock
            ("Wild Camellia Cleansing Balm", 42.00, 58, 15),
        ]
    },
    {
        "business_name": "Prism Audio & Gadgets",
        "owner_name": "Kai Takahashi",
        "email": "kai@prismaudio.io",
        "phone": "+1 415 670 9941",
        "category": "Consumer Electronics",
        "status": "active",
        "products": [
            ("Audiophile Planar Magnetic Headphones", 590.00, 20, 15),
            ("Walnut Hi-Fi Bluetooth Bookshelf Speakers", 450.00, 15, 15),
            ("Direct-Drive Vinyl Turntable System", 780.00, 7, 15), # Low stock
            ("Machined Aluminum Desk DAC & Amp", 299.00, 30, 15),
            ("Braided Oxygen-Free Copper Audio Cable", 49.00, 90, 15),
        ]
    },
    {
        "business_name": "Elysian Scents",
        "owner_name": "Amira Zahra",
        "email": "amira@elysianscents.ae",
        "phone": "+1 305 441 8320",
        "category": "Fragrance & Care",
        "status": "active",
        "products": [
            ("Royal Amber & Oud Extrait de Parfum", 240.00, 30, 15),
            ("Smoky Bergamot & Vetiver Cologne", 175.00, 45, 15),
            ("Damascus Rose Scented Soy Candle", 48.00, 80, 15),
            ("Pure Sandalwood Room Fragrance Reed", 64.00, 35, 15),
            ("Solid Brass Incense Burner & Resin", 88.00, 26, 15),
        ]
    },
    {
        "business_name": "Apex Gourmet Provisions",
        "owner_name": "Lucas Vance",
        "email": "lucas@apexgourmet.com",
        "phone": "+1 720 338 9015",
        "category": "Gourmet & Beverage",
        "status": "pending",
        "products": [
            ("A5 Japanese Wagyu Ribeye Cut (12oz)", 210.00, 12, 15), # Low stock
            ("Royal Ossetra Caviar (50g tin)", 290.00, 18, 15),
            ("Spanish Jamón Ibérico de Bellota", 195.00, 22, 15),
            ("Artisan Raw Milk Farmhouse Cheddar", 36.00, 50, 15),
            ("Black Summer Truffle Butter Jar", 28.00, 65, 15),
        ]
    },
]

WAREHOUSES = [
    "Central Warehouse",
    "West Coast Hub",
    "Metro East Facility",
    "Northern Depot",
]


def seed_database():
    """
    Idempotent database seeder. Clears all existing data in the four target tables,
    inserts 10 vendors, 50 products, 50 inventory items, and 650+ transactions spanning 6 months.
    """
    # Pre-flight connection check with clear error diagnostics
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        print("\n" + "=" * 70, file=sys.stderr)
        print("❌ Cannot connect to database for seeding:", file=sys.stderr)
        print(explain_db_error(e), file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
        print("=" * 70 + "\n", file=sys.stderr)
        sys.exit(1)

    db: Session = SessionLocal()
    try:
        print("🧹 Clearing existing data (idempotent clean of vendors, products, inventory, transactions)...")
        # Delete only the 4 application tables in order of dependencies
        db.query(Transaction).delete()
        db.query(Inventory).delete()
        db.query(Product).delete()
        db.query(Vendor).delete()
        db.commit()

        print("🌱 Seeding 10 Vendors and 50 Products...")
        created_vendors = []
        created_products = []

        now = datetime.now(timezone.utc)
        six_months_ago = now - timedelta(days=180)

        for v_data in VENDORS_DATA:
            vendor = Vendor(
                business_name=v_data["business_name"],
                owner_name=v_data["owner_name"],
                email=v_data["email"],
                phone=v_data["phone"],
                category=v_data["category"],
                status=v_data["status"],
                created_at=now - timedelta(days=random.randint(180, 240)),
            )
            db.add(vendor)
            db.flush()
            created_vendors.append(vendor)

            for p_name, price, stock, reorder_lvl in v_data["products"]:
                product = Product(
                    product_name=p_name,
                    category=v_data["category"],
                    price=price,
                    stock=stock,
                    vendor_id=vendor.vendor_id,
                )
                db.add(product)
                db.flush()
                created_products.append(product)

                inventory = Inventory(
                    product_id=product.product_id,
                    current_stock=stock,
                    warehouse=random.choice(WAREHOUSES),
                    reorder_level=reorder_lvl,
                )
                db.add(inventory)

        db.commit()
        print(f"✅ Created {len(created_vendors)} vendors and {len(created_products)} products with inventory.")

        print("💳 Generating 650+ realistic transactions spanning 6 months...")
        total_tx_count = 680
        total_revenue_generated = 0.0

        transactions_to_insert = []
        for i in range(total_tx_count):
            product = random.choice(created_products)
            vendor_id = product.vendor_id
            quantity = random.randint(1, 4)
            amount = round(quantity * product.price, 2)

            # Distribute dates across last 180 days with slight upward trend towards recent months
            day_offset = random.triangular(0, 180, 150)
            tx_date = six_months_ago + timedelta(days=day_offset, hours=random.randint(0, 23), minutes=random.randint(0, 59))

            tx = Transaction(
                product_id=product.product_id,
                vendor_id=vendor_id,
                quantity=quantity,
                amount=amount,
                transaction_date=tx_date,
            )
            transactions_to_insert.append(tx)
            total_revenue_generated += amount

        db.bulk_save_objects(transactions_to_insert)
        db.commit()

        print(f"✅ Inserted {len(transactions_to_insert)} transactions.")
        print(f"💰 Total simulated revenue: ${total_revenue_generated:,.2f}")

        # Quick validation summary
        vendor_count = db.query(Vendor).count()
        prod_count = db.query(Product).count()
        inv_count = db.query(Inventory).count()
        tx_count = db.query(Transaction).count()
        low_stock_count = db.query(Inventory).filter(Inventory.current_stock <= Inventory.reorder_level).count()

        print("\n" + "=" * 50)
        print("📊 SEED DATA VERIFICATION SUMMARY:")
        print(f"   • Vendors:           {vendor_count}")
        print(f"   • Products:          {prod_count}")
        print(f"   • Inventory Items:   {inv_count}")
        print(f"   • Low-Stock Alerts:  {low_stock_count}")
        print(f"   • Transactions:      {tx_count}")
        print(f"   • Total Revenue:     ${total_revenue_generated:,.2f}")
        print("=" * 50 + "\n")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {explain_db_error(e)}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
