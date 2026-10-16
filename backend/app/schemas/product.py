from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=150, description="Product title")
    category: str = Field(..., min_length=2, max_length=50, description="Category name")
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    stock: int = Field(..., ge=0, description="Current stock quantity")
    vendor_id: int = Field(..., gt=0, description="Associated vendor ID")

    @field_validator("product_name", "category")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be empty or only whitespace")
        return v


class ProductCreate(ProductBase):
    warehouse: Optional[str] = Field("Central Warehouse", max_length=100)
    reorder_level: Optional[int] = Field(15, ge=0)


class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = Field(None, min_length=2, max_length=50)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    vendor_id: Optional[int] = Field(None, gt=0)


class ProductResponse(ProductBase):
    product_id: int
    vendor_name: Optional[str] = None
    reorder_level: Optional[int] = 15
    warehouse: Optional[str] = "Central Warehouse"

    model_config = ConfigDict(from_attributes=True)
