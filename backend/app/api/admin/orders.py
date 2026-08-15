from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.order import Order, OrderItem, CartItem
from backend.app.models.product import Product, ProductVariant, ProductImage
from backend.app.models.user import Member, ShippingAddress
from backend.app.schemas.order import (
    OrderAdminOut, LogisticsUpdateRequest, CreateOrderForCustomerRequest,
    AllocationProductOut, AllocationVariantOut, AllocationBuyerOut
)
from backend.app.utils.auth import get_current_admin
from backend.app.utils.id_generators import generate_order_number
from backend.app.services.credit_service import process_discontinued_item_refund

router = APIRouter(prefix="/admin/orders", tags=["Admin: Order Fulfillment & Allocation"])

@router.get("", response_model=List[OrderAdminOut])
def admin_list_orders(
    tab: Optional[str] = Query(None, description="UNORDERED / UNDELIVERED / UNSHIPPED / IN_PROGRESS"),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    box_color_tag: Optional[str] = Query(None),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
            .joinedload(Product.images),
            joinedload(Order.member),
            joinedload(Order.shipping_address)
        )
    )

    if status:
        query = query.filter(Order.status == status)

    if search:
        query = query.join(Order.member).filter(
            (Order.order_number.ilike(f"%{search}%")) |
            (Member.full_name.ilike(f"%{search}%")) |
            (Member.member_id.ilike(f"%{search}%")) |
            (Member.email.ilike(f"%{search}%")) |
            (Order.tracking_code.ilike(f"%{search}%"))
        )

    return query.order_by(Order.created_at.desc()).all()

@router.get("/allocation/{product_id}", response_model=AllocationProductOut)
def get_product_allocation(
    product_id: int,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到商品")

    variants = db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()
    variant_allocations = []

    for v in variants:
        # Query order items for this variant
        items = (
            db.query(OrderItem)
            .join(OrderItem.order)
            .join(Order.member)
            .filter(OrderItem.variant_id == v.id)
            .order_by(OrderItem.preorder_submitted_at.asc())  # Prioritized by exact timestamp
            .all()
        )

        total_qty = sum(it.quantity for it in items)
        unfulfilled = sum(it.quantity for it in items if it.preorder_status == "IN_PROGRESS")

        buyers = [
            AllocationBuyerOut(
                order_id=it.order.id,
                order_number=it.order.order_number,
                order_item_id=it.id,
                member_id=it.order.member.id,
                member_name=it.order.member.full_name,
                member_code=it.order.member.member_id,
                quantity=it.quantity,
                preorder_status=it.preorder_status,
                order_status=it.order.status,
                payment_status="PAID" if it.order.status in ["PAID", "PROCESSING", "SHIPPED_TO_TW"] else "UNPAID",
                customer_remarks=it.customer_remarks,
                admin_remarks=it.admin_remarks,
                preorder_submitted_at=it.preorder_submitted_at
            )
            for it in items
        ]

        variant_allocations.append(AllocationVariantOut(
            variant_id=v.id,
            sku=v.sku,
            size_label=v.size_label,
            color=v.color,
            total_ordered_quantity=total_qty,
            unfulfilled_quantity=unfulfilled,
            buyers=buyers
        ))

    return AllocationProductOut(
        product_id=product.id,
        name_zh=product.name_zh,
        supplier=product.supplier,
        variants=variant_allocations
    )

@router.post("/items/update-logistics")
def update_item_logistics(
    payload: LogisticsUpdateRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    item = db.query(OrderItem).filter(OrderItem.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="找不到商品項目")

    if payload.preorder_status is not None:
        old_status = item.preorder_status
        item.preorder_status = payload.preorder_status
        
        # If status transitioned to OUT_OF_STOCK, trigger auto-refund
        if payload.preorder_status == "OUT_OF_STOCK" and old_status != "OUT_OF_STOCK":
            item.discontinued_date = datetime.utcnow()
            process_discontinued_item_refund(db, item)

    if payload.customer_remarks is not None:
        item.customer_remarks = payload.customer_remarks
    if payload.admin_remarks is not None:
        item.admin_remarks = payload.admin_remarks
    if payload.ordered_date_text is not None:
        item.ordered_date_text = payload.ordered_date_text
    if payload.arrival_date_text is not None:
        item.arrival_date_text = payload.arrival_date_text
    if payload.defect_date is not None:
        item.defect_date = payload.defect_date
    if payload.defect_description is not None:
        item.defect_description = payload.defect_description
    if payload.repurchase_date is not None:
        item.repurchase_date = payload.repurchase_date
    if payload.discontinued_date is not None:
        item.discontinued_date = payload.discontinued_date
        process_discontinued_item_refund(db, item)
    if payload.shipped_to_tw_date is not None:
        item.shipped_to_tw_date = payload.shipped_to_tw_date
    if payload.box_color_tag is not None:
        item.box_color_tag = payload.box_color_tag

    # Update order tracking code if provided
    if payload.tracking_code is not None:
        item.order.tracking_code = payload.tracking_code

    db.commit()
    return {"success": True, "message": "物流與備註資料已更新"}

@router.post("/create-for-customer")
def create_order_for_customer(
    payload: CreateOrderForCustomerRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="找不到會員")

    now = datetime.utcnow()
    new_order_number = generate_order_number(db, now)

    subtotal = Decimal("0.00")
    order_items_to_add = []

    for it in payload.items:
        variant = db.query(ProductVariant).filter(ProductVariant.id == it.variant_id).first()
        if not variant:
            continue
        price = variant.product.retail_price_twd
        subtotal += price * it.quantity

        order_items_to_add.append(OrderItem(
            variant_id=variant.id,
            quantity=it.quantity,
            unit_price=price,
            preorder_status="IN_PROGRESS",
            customer_remarks="由管理員為您手動登記預購",
            preorder_submitted_at=now
        ))

    shipping_fee = Decimal("80.00") if payload.shipping_type == "POST_OFFICE" else Decimal("60.00")
    total = subtotal + shipping_fee

    order = Order(
        order_number=new_order_number,
        member_id=member.id,
        status="CONFIRMED",
        shipping_type=payload.shipping_type,
        shipping_address_id=payload.shipping_address_id,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        total=total,
        customer_notes=payload.customer_notes,
        created_at=now
    )
    db.add(order)
    db.flush()

    for oi in order_items_to_add:
        oi.order_id = order.id
        db.add(oi)

    db.commit()
    return {"success": True, "order_number": order.order_number, "total": total}
