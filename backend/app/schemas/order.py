from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from backend.app.schemas.product import ProductVariantOut, ProductOut
from backend.app.schemas.user import ShippingAddressOut, MemberProfileOut

# Cart Schemas
class CartItemAdd(BaseModel):
    variant_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    cart_item_id: int
    quantity: int

class CartItemRemove(BaseModel):
    cart_item_id: int

class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    variant_id: int
    quantity: int
    added_at: datetime
    variant: Optional[ProductVariantOut] = None

class CartSummaryOut(BaseModel):
    items: List[CartItemOut] = Field(default_factory=list)
    total_items: int
    subtotal: Decimal
    bulk_discount: Decimal
    estimated_shipping: Decimal
    estimated_total: Decimal

# Checkout Schemas
class CheckoutCalculateRequest(BaseModel):
    shipping_type: str = "SEVEN_ELEVEN"  # SEVEN_ELEVEN / POST_OFFICE
    use_store_credits: bool = True
    points_card_id: Optional[int] = None

class CheckoutCalculateResponse(BaseModel):
    total_items: int
    subtotal: Decimal
    shipping_type: str
    shipping_fee: Decimal
    is_shipping_locked_post: bool  # If items > 15
    bulk_discount_applied: Decimal # NT$60 if subtotal >= 4000
    available_store_credits: Decimal
    credits_to_deduct: Decimal
    available_points: Decimal
    points_to_deduct: Decimal
    final_payable_amount: Decimal

class CheckoutSubmitRequest(BaseModel):
    shipping_type: str = "SEVEN_ELEVEN"
    shipping_address_id: Optional[int] = None
    # For custom address input
    store_name: Optional[str] = None
    store_number: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    full_address: Optional[str] = None
    # Discounts
    use_store_credits: bool = True
    points_card_id: Optional[int] = None
    # Remarks & Notes
    travel_notes: Optional[str] = None
    customer_notes: Optional[str] = None
    agreed_to_terms: bool = True

# Order Schemas
class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    variant_id: int
    quantity: int
    unit_price: Decimal
    preorder_status: str
    customer_remarks: Optional[str] = None
    ordered_date_text: Optional[str] = None
    arrival_date_text: Optional[str] = None
    defect_date: Optional[datetime] = None
    discontinued_date: Optional[datetime] = None
    shipped_to_tw_date: Optional[datetime] = None
    box_color_tag: Optional[str] = None
    preorder_submitted_at: datetime
    variant: Optional[ProductVariantOut] = None

class OrderItemAdminOut(OrderItemOut):
    admin_remarks: Optional[str] = None
    defect_description: Optional[str] = None
    repurchase_date: Optional[datetime] = None

class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    status: str
    shipping_type: str
    subtotal: Decimal
    shipping_fee: Decimal
    discount_amount: Decimal
    credits_used: Decimal
    points_used: Decimal
    total: Decimal
    payment_method: Optional[str] = None
    payment_deadline: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    tracking_code: Optional[str] = None
    shipped_date: Optional[datetime] = None
    travel_notes: Optional[str] = None
    customer_notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = Field(default_factory=list)
    shipping_address: Optional[ShippingAddressOut] = None

class OrderAdminOut(OrderOut):
    items: List[OrderItemAdminOut] = Field(default_factory=list)
    daily_batch_label: Optional[str] = None
    is_overdue: bool
    overdue_stage: int
    member: Optional[MemberProfileOut] = None

# Admin Logistics & Allocation
class LogisticsUpdateRequest(BaseModel):
    item_id: int
    preorder_status: Optional[str] = None
    customer_remarks: Optional[str] = None
    admin_remarks: Optional[str] = None
    ordered_date_text: Optional[str] = None
    arrival_date_text: Optional[str] = None
    defect_date: Optional[datetime] = None
    defect_description: Optional[str] = None
    repurchase_date: Optional[datetime] = None
    discontinued_date: Optional[datetime] = None
    shipped_to_tw_date: Optional[datetime] = None
    box_color_tag: Optional[str] = None
    tracking_code: Optional[str] = None

class CreateOrderForCustomerRequest(BaseModel):
    member_id: int
    items: List[CartItemAdd]
    shipping_type: str = "SEVEN_ELEVEN"
    shipping_address_id: Optional[int] = None
    customer_notes: Optional[str] = None

class AllocationBuyerOut(BaseModel):
    order_id: int
    order_number: str
    order_item_id: int
    member_id: int
    member_name: str
    member_code: Optional[str] = None
    quantity: int
    preorder_status: str
    order_status: str
    payment_status: str
    customer_remarks: Optional[str] = None
    admin_remarks: Optional[str] = None
    preorder_submitted_at: datetime

class AllocationVariantOut(BaseModel):
    variant_id: int
    sku: str
    size_label: Optional[str] = None
    color: Optional[str] = None
    total_ordered_quantity: int
    unfulfilled_quantity: int
    buyers: List[AllocationBuyerOut] = Field(default_factory=list)

class AllocationProductOut(BaseModel):
    product_id: int
    name_zh: str
    supplier: Optional[str] = None
    variants: List[AllocationVariantOut] = Field(default_factory=list)
