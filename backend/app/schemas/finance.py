from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

# Messaging Schemas
class MessageSendRequest(BaseModel):
    content: str

class MessageAdminSendIndividual(BaseModel):
    recipient_id: int
    content: str

class MessageAdminSendBulk(BaseModel):
    recipient_ids: List[int]
    template_id: Optional[int] = None
    custom_content: Optional[str] = None
    placeholders: Optional[dict] = None

class MessageTemplateCreate(BaseModel):
    template_name: str
    template_content: str
    template_type: str = "CUSTOM"

class MessageTemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    template_name: str
    template_content: str
    template_type: str
    created_at: datetime

class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    sender_id: Optional[int] = None
    recipient_id: int
    content: str
    is_read: bool
    is_bulk: bool
    message_type: str
    created_at: datetime
    sender_name: Optional[str] = None

class UnreadCountOut(BaseModel):
    unread_count: int

# Payment Schemas
class PaymentConfirmRequest(BaseModel):
    order_id: int
    last_5_digits: Optional[str] = None
    payment_method: str = "MANUAL_TRANSFER"
    notes: Optional[str] = None

class PaymentRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: int
    member_id: int
    amount: Decimal
    payment_method: str
    virtual_account_number: Optional[str] = None
    last_5_digits: Optional[str] = None
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

# Expense & Income Ledger Schemas
class ExpenseLedgerCreate(BaseModel):
    entry_date: date
    category: str
    amount_twd: Decimal = Decimal("0.00")
    amount_gbp: Decimal = Decimal("0.00")
    formula_notes: Optional[str] = None
    remarks: Optional[str] = None

class ExpenseLedgerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    entry_date: date
    category: str
    amount_twd: Decimal
    amount_gbp: Decimal
    formula_notes: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

class IncomeLedgerCreate(BaseModel):
    entry_date: date
    amount_twd: Decimal
    member_id: Optional[int] = None
    order_id: Optional[int] = None
    remarks: Optional[str] = None

class IncomeLedgerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    entry_date: date
    amount_twd: Decimal
    member_id: Optional[int] = None
    order_id: Optional[int] = None
    remarks: Optional[str] = None
    created_at: datetime

# Financial Report & Analytics Schemas
class FinancialReportSummary(BaseModel):
    start_date: date
    end_date: date
    total_orders_count: int
    total_items_sold: int
    gross_revenue_with_shipping: Decimal
    gross_revenue_without_shipping: Decimal
    total_procurement_cost_twd: Decimal
    total_operational_expenses_twd: Decimal
    net_profit_twd: Decimal
    average_order_value_aov: Decimal
    orders_by_status: dict = Field(default_factory=dict)
