from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Numeric, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_number = Column(String(20), unique=True, index=True, nullable=False)  # YYMM0001
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(30), default="PENDING", nullable=False, index=True)
    # PENDING / CONFIRMED / PAYMENT_NOTIFIED / PAID / PROCESSING / SHIPPED_TO_TW / ARRIVED_TW / SHIPPED_TO_CUSTOMER / DELIVERED / OVERDUE_GRACE / OVERDUE_FINAL / ABANDONED / CANCELLED
    shipping_type = Column(String(20), nullable=False)                          # SEVEN_ELEVEN / POST_OFFICE
    shipping_address_id = Column(Integer, ForeignKey("shipping_addresses.id", ondelete="SET NULL"), nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=False)
    shipping_fee = Column(Numeric(10, 2), default=60.00, nullable=False)        # NT$60 or NT$80
    discount_amount = Column(Numeric(10, 2), default=0.00, nullable=False)      # NT$60 for >= NT$4,000
    credits_used = Column(Numeric(10, 2), default=0.00, nullable=False)
    points_used = Column(Numeric(10, 2), default=0.00, nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(30), default="VIRTUAL_ACCOUNT", nullable=True)
    payment_deadline = Column(DateTime, nullable=True)
    payment_date = Column(DateTime, nullable=True)
    tracking_code = Column(String(50), nullable=True)                           # 7-11 C2C / Post office code
    shipped_date = Column(DateTime, nullable=True)
    travel_notes = Column(Text, nullable=True)                                  # Customer's upcoming travel dates
    customer_notes = Column(Text, nullable=True)
    daily_batch_label = Column(String(30), nullable=True)                       # e.g. "2026/04/11 (1)"
    is_overdue = Column(Boolean, default=False, nullable=False)
    overdue_stage = Column(Integer, default=0, nullable=False)                  # 0=none, 1=grace, 2=final, 3=abandoned
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    member = relationship("Member", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment_records = relationship("PaymentRecord", back_populates="order")
    shipping_address = relationship("ShippingAddress")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    preorder_status = Column(String(20), default="IN_PROGRESS", nullable=False, index=True)
    # IN_PROGRESS (處理中) / REGISTERED (已登記) / OUT_OF_STOCK (斷貨)
    customer_remarks = Column(Text, nullable=True)                             # 給客人看的備註 (會員可見)
    admin_remarks = Column(Text, nullable=True)                                # 僅後台看得到的備註 (會員隱藏)
    ordered_date_text = Column(String(50), nullable=True)                      # Open-text e.g. "2026/6/7(1)"
    arrival_date_text = Column(String(50), nullable=True)                      # Open-text e.g. "2026/6/7(2)"
    defect_date = Column(DateTime, nullable=True)
    defect_description = Column(Text, nullable=True)
    repurchase_date = Column(DateTime, nullable=True)
    repurchase_arrival_date = Column(DateTime, nullable=True)
    discontinued_date = Column(DateTime, nullable=True)                        # Triggers store credit refund
    shipped_to_tw_date = Column(DateTime, nullable=True)
    box_color_tag = Column(String(50), nullable=True)                          # Color-coded box identifier
    preorder_submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)  # Allocation key
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="items")
    variant = relationship("ProductVariant", back_populates="order_items")


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(30), nullable=False)
    virtual_account_number = Column(String(50), nullable=True)
    last_5_digits = Column(String(5), nullable=True)
    status = Column(String(20), default="PENDING", nullable=False)              # PENDING / CONFIRMED / FAILED
    paid_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("Order", back_populates="payment_records")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    member = relationship("Member", back_populates="cart_items")
    variant = relationship("ProductVariant", back_populates="cart_items")


class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    member = relationship("Member", back_populates="wishlist_items")
    product = relationship("Product")
