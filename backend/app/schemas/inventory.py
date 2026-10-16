from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class InventoryBase(BaseModel):
    product_id: int = Field(..., gt=0)
    current_stock: int = Field(..., ge=0)
    warehouse: str = Field(..., min_length=2, max_length=100)
    reorder_level: int = Field(15, ge=0)


class InventoryUpdate(BaseModel):
    current_stock: Optional[int] = Field(None, ge=0)
    warehouse: Optional[str] = Field(None, min_length=2, max_length=100)
    reorder_level: Optional[int] = Field(None, ge=0)


class InventoryResponse(InventoryBase):
    inventory_id: int
    product_name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    vendor_id: Optional[int] = None
    vendor_name: Optional[str] = None
    is_low_stock: bool = False

    model_config = ConfigDict(from_attributes=True)
