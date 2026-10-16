import os
import sys

# Configure UTF-8 encoding for Windows stdout/stderr
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import OperationalError

# Load .env file from the backend folder and current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
load_dotenv(os.path.join(backend_dir, ".env"))
load_dotenv()

# Read DATABASE_URL from environment with NO hardcoded fallback
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL or not DATABASE_URL.strip():
    err_msg = (
        "❌ CONFIGURATION ERROR: 'DATABASE_URL' is missing or empty in backend/.env!\n"
        "Please specify a valid connection string in backend/.env, for example:\n"
        "DATABASE_URL=postgresql://postgres:your_password@localhost:5432/shopIQ"
    )
    print(err_msg, file=sys.stderr)
    raise ValueError(err_msg)

# Ensure psycopg2 driver is used if generic postgresql:// is provided
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)


def explain_db_error(e: Exception) -> str:
    """
    Translates raw database connection errors into clear, actionable error messages.
    """
    err_str = str(e).lower()
    if "password authentication failed" in err_str:
        return (
            "❌ PostgreSQL Authentication Error: Password authentication failed for the database user.\n"
            "   Please check your password in backend/.env (ensure special characters like '@' are URL-encoded as '%40')."
        )
    elif "does not exist" in err_str:
        return (
            "❌ PostgreSQL Database Error: The target database does not exist on the PostgreSQL server.\n"
            "   Please verify the database name in backend/.env (note: database names are case-sensitive, e.g. 'shopIQ')."
        )
    elif any(phrase in err_str for phrase in ["could not connect", "connection refused", "is the server running", "timeout expired", "nodename nor servname provided"]):
        return (
            "❌ PostgreSQL Connection Error: Unable to connect to the PostgreSQL server.\n"
            "   Please ensure that the PostgreSQL service is running and listening on the specified host and port.\n"
            "   (On Windows PowerShell: verify with 'Get-Service postgresql*' or start with 'Start-Service postgresql*')."
        )
    return f"❌ Database Connection Error: {e}"


try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )
except Exception as e:
    print(explain_db_error(e), file=sys.stderr)
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session and ensures it closes.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Checks if the database is accessible via a SELECT 1 query.
    Prints clear diagnostic errors if unreachable.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            return True
    except OperationalError as e:
        print(explain_db_error(e), file=sys.stderr)
        return False
    except Exception as e:
        print(f"❌ Unexpected database check error: {e}", file=sys.stderr)
        return False
