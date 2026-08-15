from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    Numeric, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("members.id", ondelete="SET NULL"), nullable=True)  # NULL=System
    recipient_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    is_bulk = Column(Boolean, default=False, nullable=False)
    message_type = Column(String(20), default="PERSONAL", nullable=False)       # PERSONAL / BULK / SYSTEM / AUTO_REPLY
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    sender = relationship("Member", foreign_keys=[sender_id])
    recipient = relationship("Member", foreign_keys=[recipient_id])


class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    template_name = Column(String(100), nullable=False)
    template_content = Column(Text, nullable=False)
    template_type = Column(String(30), default="CUSTOM", nullable=False)        # SHIPPING / PAYMENT_REMINDER / OVERDUE / PICKUP_REMINDER / CUSTOM
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class PointsCard(Base):
    __tablename__ = "points_cards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)                             # 1 pt = NT$1
    remaining = Column(Numeric(10, 2), nullable=False)
    expiry_date = Column(DateTime, nullable=True, index=True)                   # NULL = no expiry
    is_used = Column(Boolean, default=False, nullable=False)
    issued_reason = Column(String(100), nullable=True)                          # e.g. "Registration bonus"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    member = relationship("Member", back_populates="points_cards")


class ExpenseLedger(Base):
    __tablename__ = "expense_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entry_date = Column(Date, nullable=False, index=True)
    amount_twd = Column(Numeric(12, 2), default=0.00, nullable=False)
    amount_gbp = Column(Numeric(12, 2), default=0.00, nullable=False)
    category = Column(String(30), nullable=False, index=True)
    # ASSISTANT_SALARY / UK_LOCAL_SHIPPING / INTL_FREIGHT / PACKAGING / OTHER
    formula_notes = Column(Text, nullable=True)                                 # e.g. "(60*42*40)/5000 = 20.16kg"
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class IncomeLedger(Base):
    __tablename__ = "income_ledger"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entry_date = Column(Date, nullable=False, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="SET NULL"), nullable=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    amount_twd = Column(Numeric(12, 2), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    member = relationship("Member")
    order = relationship("Order")


class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
