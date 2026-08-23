from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class CategoryBase(BaseModel):
    name_zh: str
    name_en: str
    tier_type: str  # GENDER_TYPE / AGE_GROUP
    sort_order: int = 0
    parent_id: Optional[int] = None

class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    children: Optional[List["CategoryOut"]] = Field(default_factory=list)

class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    image_url: str
    sort_order: int
    is_primary: bool

class ProductSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name_zh: str
    name_en: Optional[str] = None
    category_id: Optional[int] = None
    retail_price_twd: Decimal
    images: List[ProductImageOut] = Field(default_factory=list)

class ProductVariantBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    sku: str
    size_label: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    stock_quantity: int = 0
    is_available: bool = True

class ProductVariantCreate(BaseModel):
    sku: Optional[str] = None
    size_label: str
    color: Optional[str] = None
    style: Optional[str] = None
    stock_quantity: int = 0

class ProductVariantOut(ProductVariantBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product: Optional[ProductSummaryOut] = None

class ProductBase(BaseModel):
    name_zh: str
    name_en: Optional[str] = None
    category_id: Optional[int] = None
    campaign_id: Optional[int] = None
    retail_price_twd: Decimal
    description: Optional[str] = None
    size_chart_url: Optional[str] = None

class ProductCreate(ProductBase):
    supplier: Optional[str] = None
    cost_gbp: Optional[Decimal] = None
    images: List[str] = []
    variants: List[ProductVariantCreate] = []

class ProductUpdate(BaseModel):
    product_id: int
    name_zh: Optional[str] = None
    name_en: Optional[str] = None
    category_id: Optional[int] = None
    campaign_id: Optional[int] = None
    supplier: Optional[str] = None
    cost_gbp: Optional[Decimal] = None
    retail_price_twd: Optional[Decimal] = None
    description: Optional[str] = None
    size_chart_url: Optional[str] = None
    is_listed: Optional[bool] = None
    images: Optional[List[str]] = None
    variants: Optional[List[ProductVariantCreate]] = None

class ProductArchiveRequest(BaseModel):
    product_id: int

class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name_zh: str
    name_en: Optional[str] = None
    category_id: Optional[int] = None
    campaign_id: Optional[int] = None
    retail_price_twd: Decimal
    description: Optional[str] = None
    size_chart_url: Optional[str] = None
    is_listed: bool
    is_archived: bool
    category: Optional[CategoryOut] = None
    variants: List[ProductVariantBase] = []
    images: List[ProductImageOut] = []
    created_at: datetime

class ProductAdminOut(ProductOut):
    supplier: Optional[str] = None
    cost_gbp: Optional[Decimal] = None

class GroupCampaignBase(BaseModel):
    display_title: str
    promotional_copy: Optional[str] = None
    scheduled_publish_at: Optional[datetime] = None
    is_active: bool = True

class GroupCampaignCreate(GroupCampaignBase):
    pass

class GroupCampaignOut(GroupCampaignBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    products: List[ProductOut] = []
