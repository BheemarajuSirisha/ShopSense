from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    vendor_id = Column(
        Integer,
        ForeignKey("vendors.vendor_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    quantity = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_date = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    # Relationships
    product = relationship("Product", back_populates="transactions")
    vendor = relationship("Vendor", back_populates="transactions")
