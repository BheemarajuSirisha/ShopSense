import re
from datetime import datetime, timezone


def clean_string(value: str) -> str:
    """Strips leading and trailing whitespace."""
    return value.strip() if value else ""


def is_valid_email(email: str) -> bool:
    """Basic format validation for email strings."""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email.strip())) if email else False


def utc_now() -> datetime:
    """Returns current UTC datetime with timezone awareness."""
    return datetime.now(timezone.utc)
