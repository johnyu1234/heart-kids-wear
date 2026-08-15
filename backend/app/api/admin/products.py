from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.product import Product, ProductVariant, ProductImage, Category, GroupCampaign
from backend.app.schemas.product import (
    ProductCreate, ProductUpdate, ProductArchiveRequest,
    ProductAdminOut, CategoryOut, CategoryBase, GroupCampaignCreate, GroupCampaignOut
)
from backend.app.utils.auth import get_current_admin
from backend.app.utils.id_generators import generate_sku

router = APIRouter(prefix="/admin/products", tags=["Admin: Product Management"])

@router.get("", response_model=List[ProductAdminOut])
def admin_list_products(
    include_archived: bool = True,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.category)
    )
    if not include_archived:
        query = query.filter(Product.is_archived == False)
    return query.order_by(Product.created_at.desc()).all()

@router.post("/import", response_model=ProductAdminOut)
def import_product(
    payload: ProductCreate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = Product(
        name_zh=payload.name_zh,
        name_en=payload.name_en,
        category_id=payload.category_id,
        campaign_id=payload.campaign_id,
        supplier=payload.supplier,
        cost_gbp=payload.cost_gbp,
        retail_price_twd=payload.retail_price_twd,
        description=payload.description,
        size_chart_url=payload.size_chart_url,
        is_listed=True,
        is_archived=False
    )
    db.add(product)
    db.flush()

    # Images
    for idx, img_url in enumerate(payload.images):
        db.add(ProductImage(
            product_id=product.id,
            image_url=img_url,
            sort_order=idx + 1,
            is_primary=(idx == 0)
        ))

    # Variants with independent SKUs
    for v in payload.variants:
        sku = v.sku or generate_sku(product.id, v.size_label, v.color)
        db.add(ProductVariant(
            product_id=product.id,
            sku=sku,
            size_label=v.size_label,
            color=v.color,
            style=v.style,
            stock_quantity=v.stock_quantity,
            is_available=True
        ))

    db.commit()
    db.refresh(product)
    return product

@router.post("/update", response_model=ProductAdminOut)
def update_product(
    payload: ProductUpdate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到商品")

    for key, value in payload.dict(exclude_unset=True, exclude={"product_id"}).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

@router.post("/archive")
def archive_product(
    payload: ProductArchiveRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到商品")

    product.is_archived = True
    product.is_listed = False
    db.commit()
    return {"success": True, "message": "商品已封存歸檔"}

@router.post("/relaunch")
def relaunch_product(
    payload: ProductArchiveRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到商品")

    product.is_archived = False
    product.is_listed = True
    db.commit()
    return {"success": True, "message": "商品已一鍵重啟上架"}

# Category & Campaign Admin
@router.post("/categories/create", response_model=CategoryOut)
def create_category(
    payload: CategoryBase,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    cat = Category(**payload.dict())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.post("/campaigns/create", response_model=GroupCampaignOut)
def create_campaign(
    payload: GroupCampaignCreate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    campaign = GroupCampaign(**payload.dict())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign
