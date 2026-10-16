from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
import re


class VendorBase(BaseModel):
    business_name: str = Field(..., min_length=2, max_length=150, description="Business or brand name")
    owner_name: str = Field(..., min_length=2, max_length=100, description="Owner full name")
    email: EmailStr = Field(..., description="Unique contact email")
    phone: str = Field(..., min_length=7, max_length=30, description="Contact phone number")
    category: str = Field(..., min_length=2, max_length=50, description="Vendor product category")

    @field_validator("business_name", "owner_name", "category")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty or only whitespace")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = v.strip()
        # Basic check: at least 7 digits, allowed chars +, -, (), space
        digits = re.sub(r"\D", "", clean)
        if len(digits) < 7 or len(digits) > 15:
            raise ValueError("Phone number must contain between 7 and 15 digits")
        return clean


class VendorCreate(VendorBase):
    status: Optional[Literal["pending", "active", "suspended"]] = "active"


class VendorUpdate(BaseModel):
    business_name: Optional[str] = Field(None, min_length=2, max_length=150)
    owner_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=7, max_length=30)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    status: Optional[Literal["pending", "active", "suspended"]] = None


class VendorStatusUpdate(BaseModel):
    status: Literal["pending", "active", "suspended"]


class VendorResponse(VendorBase):
    vendor_id: int
    status: str
    created_at: datetime
    products_count: Optional[int] = 0
    total_revenue: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)
