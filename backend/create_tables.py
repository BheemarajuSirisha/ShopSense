import os
import sys

# Configure UTF-8 encoding for Windows stdout/stderr
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from urllib.parse import urlparse, unquote
from dotenv import load_dotenv

# Load .env strictly from the backend directory and current working directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv()

# Read DATABASE_URL without hardcoded fallback
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL or not DATABASE_URL.strip():
    err_msg = (
        "❌ CONFIGURATION ERROR: 'DATABASE_URL' is missing or empty in backend/.env!\n"
        "Please specify DATABASE_URL in backend/.env, for example:\n"
        "DATABASE_URL=postgresql://postgres:your_password@localhost:5432/shopIQ"
    )
    print(err_msg, file=sys.stderr)
    raise ValueError(err_msg)

# Parse URL components for diagnostics
parsed = urlparse(DATABASE_URL)
user = parsed.username or "postgres"
password = unquote(parsed.password or "")
host = parsed.hostname or "localhost"
port = parsed.port or 5432
dbname = parsed.path.lstrip("/") or "shopIQ"


def explain_db_error(e: Exception) -> str:
    """
    Translates raw database connection errors into clear, actionable error messages.
    """
    err_str = str(e).lower()
    if "password authentication failed" in err_str:
        return (
            "❌ PostgreSQL Authentication Error: Password authentication failed for user '{user}'.\n"
            "   Please check your password in backend/.env (ensure special characters like '@' are URL-encoded as '%40').".format(user=user)
        )
    elif "does not exist" in err_str:
        return (
            "❌ PostgreSQL Database Error: Database '{dbname}' does not exist on PostgreSQL server at {host}:{port}.\n"
            "   Please verify the database name in backend/.env (database names are case-sensitive).".format(dbname=dbname, host=host, port=port)
        )
    elif any(phrase in err_str for phrase in ["could not connect", "connection refused", "is the server running", "timeout expired", "nodename nor servname provided"]):
        return (
            "❌ PostgreSQL Connection Error: Unable to connect to PostgreSQL server at {host}:{port}.\n"
            "   Please ensure that the PostgreSQL service is running and accessible.\n"
            "   (On Windows PowerShell: verify with 'Get-Service postgresql*' or start with 'Start-Service postgresql*').".format(host=host, port=port)
        )
    return f"❌ Database Connection Error: {e}"


def check_connection_and_list_existing_tables():
    """
    Connects ONLY to the target database specified in DATABASE_URL.
    Verifies connectivity, runs 'SELECT 1', and inspects any tables that already exist.
    Does NOT touch, create, or modify other databases.
    """
    from sqlalchemy import inspect, text
    from app.database import engine

    print(f"🔍 Connecting to database '{dbname}' at {host}:{port}...")

    try:
        with engine.connect() as conn:
            # 1. Run SELECT 1 verification
            result = conn.execute(text("SELECT 1")).scalar()
            if result != 1:
                raise RuntimeError("SELECT 1 verification returned unexpected result.")
            print(f"✅ Connection successful! (SELECT 1 passed)")

        # 2. Inspect existing tables in the target database
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()

        print("\n" + "=" * 60)
        print(f"📋 EXISTING TABLES IN '{dbname}':")
        if existing_tables:
            for tbl in sorted(existing_tables):
                print(f"   • {tbl}")
        else:
            print("   (No tables currently exist in this database)")
        print("=" * 60 + "\n")

        return existing_tables

    except Exception as e:
        print("\n" + "=" * 70, file=sys.stderr)
        print(explain_db_error(e), file=sys.stderr)
        print(f"Raw error details: {e}", file=sys.stderr)
        print("=" * 70 + "\n", file=sys.stderr)
        sys.exit(1)


def create_missing_tables(existing_tables):
    """
    Imports all models and creates ONLY missing tables using Base.metadata.create_all().
    Does NOT drop existing tables.
    """
    from app.database import Base, engine
    from app.models.vendor import Vendor
    from app.models.product import Product
    from app.models.inventory import Inventory
    from app.models.transaction import Transaction

    required_tables = {"vendors", "products", "inventory", "transactions"}
    missing_tables = required_tables - set(existing_tables)

    print("🔨 Checking required application tables...")
    print(f"   Required tables: {sorted(list(required_tables))}")
    print(f"   Missing tables to create: {sorted(list(missing_tables)) if missing_tables else 'None (all exist)'}")

    try:
        # Base.metadata.create_all() will ONLY create tables that do not already exist in the database
        Base.metadata.create_all(bind=engine)

        from sqlalchemy import inspect
        current_tables = inspect(engine).get_table_names()

        print("\n✅ Table creation check completed. Current tables in database:")
        for table_name in sorted(current_tables):
            is_new = table_name in missing_tables
            status_tag = "🆕 [CREATED]" if is_new else "✓ [PRE-EXISTING]"
            print(f"   • {table_name:20} {status_tag}")

    except Exception as e:
        print(f"❌ Failed to create tables: {explain_db_error(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    print("=" * 60)
    print("ShopSense – Database Connectivity & Table Setup")
    print(f"   Target Database: {dbname}")
    print("=" * 60)

    existing = check_connection_and_list_existing_tables()
    create_missing_tables(existing)
    print("\n🎉 Table setup finished successfully!\n")
