from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    inventory_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(
        Integer,
        ForeignKey("products.product_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    current_stock = Column(Integer, nullable=False, default=0)
    warehouse = Column(String(100), nullable=False, default="Central Warehouse")
    reorder_level = Column(Integer, nullable=False, default=15)

    # Relationships
    product = relationship("Product", back_populates="inventory")
