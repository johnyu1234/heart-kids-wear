from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Numeric, Text, ForeignKey
)
from sqlalchemy.orm import relationship, backref
from backend.app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name_zh = Column(String(50), nullable=False)
    name_en = Column(String(50), nullable=False)
    tier_type = Column(String(20), nullable=False)  # GENDER_TYPE / AGE_GROUP
    sort_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    children = relationship("Category", backref=backref("parent", remote_side=[id]), cascade="all, delete-orphan")
    products = relationship("Product", back_populates="category")


class GroupCampaign(Base):
    __tablename__ = "group_campaigns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    display_title = Column(String(200), nullable=False)                    # Obfuscated brand title (群組團)
    promotional_copy = Column(Text, nullable=True)                         # Marketing copy
    scheduled_publish_at = Column(DateTime, nullable=True)
    scheduled_delist_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    products = relationship("Product", back_populates="campaign")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    campaign_id = Column(Integer, ForeignKey("group_campaigns.id", ondelete="SET NULL"), nullable=True)
    name_zh = Column(String(200), nullable=False, index=True)
    name_en = Column(String(200), nullable=True)
    supplier = Column(String(100), nullable=True)                          # Admin-only
    cost_gbp = Column(Numeric(10, 2), nullable=True)                       # Cost in GBP (admin-only)
    retail_price_twd = Column(Numeric(10, 2), nullable=False, index=True)  # NT$ price
    description = Column(Text, nullable=True)
    size_chart_url = Column(String(500), nullable=True)
    is_listed = Column(Boolean, default=True, nullable=False, index=True)
    is_archived = Column(Boolean, default=False, nullable=False)           # For one-click relaunch
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="products")
    campaign = relationship("GroupCampaign", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    sku = Column(String(50), unique=True, index=True, nullable=False)      # Independent SKU per size/color
    size_label = Column(String(20), nullable=True)                         # 2-3y, 3-4y, etc.
    color = Column(String(50), nullable=True)
    style = Column(String(100), nullable=True)
    stock_quantity = Column(Integer, default=0, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    product = relationship("Product", back_populates="variants")
    order_items = relationship("OrderItem", back_populates="variant")
    cart_items = relationship("CartItem", back_populates="variant")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)

    product = relationship("Product", back_populates="images")
