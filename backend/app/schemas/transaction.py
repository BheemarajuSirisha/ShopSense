from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    product_id: int = Field(..., gt=0)
    vendor_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    amount: float = Field(..., gt=0)
    transaction_date: Optional[datetime] = None


class TransactionCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    vendor_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    amount: Optional[float] = Field(None, gt=0)
    transaction_date: Optional[datetime] = None


class TransactionResponse(TransactionBase):
    transaction_id: int
    product_name: Optional[str] = None
    vendor_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
