from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class ShippingAddressBase(BaseModel):
    address_type: str = "SEVEN_ELEVEN"  # SEVEN_ELEVEN / POST_OFFICE
    store_name: Optional[str] = None
    store_number: Optional[str] = None
    recipient_name: str
    recipient_phone: str
    full_address: Optional[str] = None
    is_primary: bool = False

class ShippingAddressCreate(ShippingAddressBase):
    pass

class ShippingAddressOut(ShippingAddressBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class MemberRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    date_of_birth: Optional[date] = None
    phone: str
    contact_address: Optional[str] = None
    ig_handle: Optional[str] = None
    fb_handle: Optional[str] = None
    line_handle: Optional[str] = None
    marketing_source: Optional[str] = None  # FB / IG / LINE
    store_name: Optional[str] = None
    store_number: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    agreed_to_rules: bool = True
    remember_me: bool = False

class MemberLogin(BaseModel):
    email: str
    password: str
    remember_me: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_admin: bool = False
    member_id: Optional[str] = None
    full_name: str
    email: str

class MemberProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    member_id: Optional[str] = None
    email: str
    full_name: str
    date_of_birth: Optional[date] = None
    phone: str
    contact_address: Optional[str] = None
    ig_handle: Optional[str] = None
    fb_handle: Optional[str] = None
    line_handle: Optional[str] = None
    marketing_source: Optional[str] = None
    store_credits: Decimal
    total_purchases: int
    overdue_count: int
    admin_remarks: Optional[str] = None
    is_admin: bool
    is_blacklisted: bool
    created_at: datetime
    shipping_addresses: List[ShippingAddressOut] = Field(default_factory=list)

class MemberProfileUpdate(BaseModel):
    contact_address: Optional[str] = None
    ig_handle: Optional[str] = None
    fb_handle: Optional[str] = None
    line_handle: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    new_password: Optional[str] = None
    shipping_addresses: Optional[List[ShippingAddressCreate]] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str
    new_password: str

class PointsCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    amount: Decimal
    remaining: Decimal
    expiry_date: Optional[datetime] = None
    is_used: bool
    issued_reason: Optional[str] = None
    created_at: datetime

class MemberEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    event_date: date
    event_type: str
    event_description: Optional[str] = None
    created_at: datetime
