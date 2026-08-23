from typing import List, Optional
import time
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.product import Product, Category, GroupCampaign
from backend.app.schemas.product import ProductOut, GroupCampaignOut

router = APIRouter(prefix="/products", tags=["Product Catalog"])

# In-memory cache for product list queries (30s TTL)
_product_cache = {}
_PRODUCT_CACHE_TTL = 30

@router.get("", response_model=List[ProductOut])
def list_products(
    category_id: Optional[int] = Query(None, description="Category ID to filter by"),
    campaign_id: Optional[int] = Query(None, description="Group campaign ID"),
    sort: Optional[str] = Query(None, description="price_asc or price_desc"),
    search: Optional[str] = Query(None, description="Keyword search in product name"),
    db: Session = Depends(get_db)
):
    # Build cache key from query params
    cache_key = f"{category_id}:{campaign_id}:{sort}:{search}"
    now = time.time()

    if cache_key in _product_cache:
        cached_data, cached_at = _product_cache[cache_key]
        if (now - cached_at) < _PRODUCT_CACHE_TTL:
            return cached_data

    query = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        )
        .filter(Product.is_listed == True, Product.is_archived == False)
    )

    if category_id:
        # Check if category is parent or child
        cat = db.query(Category).filter(Category.id == category_id).first()
        if cat and not cat.parent_id:
            child_ids = [c.id for c in cat.children]
            query = query.filter(Product.category_id.in_([category_id] + child_ids))
        else:
            query = query.filter(Product.category_id == category_id)

    if campaign_id:
        query = query.filter(Product.campaign_id == campaign_id)

    if search:
        query = query.filter(
            (Product.name_zh.ilike(f"%{search}%")) | (Product.name_en.ilike(f"%{search}%"))
        )

    # Sorting
    if sort == "price_asc":
        query = query.order_by(Product.retail_price_twd.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.retail_price_twd.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    results = query.all()
    _product_cache[cache_key] = (results, now)
    return results

@router.get("/{product_id}", response_model=ProductOut)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        )
        .filter(Product.id == product_id, Product.is_listed == True)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="找不到此商品 (Product not found)")
    return product

@router.get("/campaign/{campaign_id}", response_model=GroupCampaignOut)
def get_group_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = (
        db.query(GroupCampaign)
        .options(joinedload(GroupCampaign.products))
        .filter(GroupCampaign.id == campaign_id, GroupCampaign.is_active == True)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="找不到此團購活動 (Campaign not found)")
    return campaign
