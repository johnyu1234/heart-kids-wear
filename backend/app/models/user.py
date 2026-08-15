from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, 
    Numeric, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(String(10), unique=True, index=True, nullable=True)  # YYMM + 3-digit e.g. 2604004
    email = Column(String(255), unique=True, index=True, nullable=False)    # Stored lowercase
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)                         # Legal ID name, immutable
    date_of_birth = Column(Date, nullable=True)
    phone = Column(String(20), nullable=False)
    contact_address = Column(Text, nullable=True)
    ig_handle = Column(String(100), nullable=True)
    fb_handle = Column(String(100), nullable=True)
    line_handle = Column(String(100), nullable=True)
    marketing_source = Column(String(20), nullable=True)                   # FB / IG / LINE
    store_credits = Column(Numeric(10, 2), default=0.00, nullable=False)   # 永久有效
    total_purchases = Column(Integer, default=0, nullable=False)
    overdue_count = Column(Integer, default=0, nullable=False)
    admin_remarks = Column(Text, nullable=True)                            # e.g. "愛遲繳"
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    agreed_to_rules = Column(Boolean, default=False, nullable=False)
    remember_me = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    shipping_addresses = relationship("ShippingAddress", back_populates="member", cascade="all, delete-orphan")
    events = relationship("MemberEvent", back_populates="member", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="member")
    cart_items = relationship("CartItem", back_populates="member", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="member", cascade="all, delete-orphan")
    points_cards = relationship("PointsCard", back_populates="member", cascade="all, delete-orphan")


class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    address_type = Column(String(20), nullable=False)                       # SEVEN_ELEVEN / POST_OFFICE
    store_name = Column(String(100), nullable=True)                        # 7-11 store name
    store_number = Column(String(20), nullable=True)                       # 7-11 store code
    recipient_name = Column(String(100), nullable=False)
    recipient_phone = Column(String(20), nullable=False)
    full_address = Column(Text, nullable=True)                             # Post office home address
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    member = relationship("Member", back_populates="shipping_addresses")


class MemberEvent(Base):
    __tablename__ = "member_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    event_date = Column(Date, nullable=False, default=datetime.utcnow().date)
    event_type = Column(String(30), nullable=False)                        # LATE_PAYMENT / STOCKOUT_REFUND / PACKAGE_RETURNED / ORDER_ABANDONED / NOTE
    event_description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    member = relationship("Member", back_populates="events")
