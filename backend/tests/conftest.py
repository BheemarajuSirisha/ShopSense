import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
from app.database import SessionLocal


@pytest.fixture(scope="session")
def db_session():
    """Yields a database session for testing."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    """Yields a FastAPI TestClient."""
    with TestClient(app) as c:
        yield c
