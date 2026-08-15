from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.order import Order, OrderItem
from backend.app.models.product import ProductVariant, Product
from backend.app.models.user import Member
from backend.app.schemas.order import OrderOut
from backend.app.utils.auth import get_current_member

router = APIRouter(prefix="/orders", tags=["Orders & Pre-Order Tracking"])

@router.get("", response_model=List[OrderOut])
def get_member_orders(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
            .joinedload(Product.images),
            joinedload(Order.shipping_address)
        )
        .filter(Order.member_id == current_member.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders

@router.get("/{order_number}", response_model=OrderOut)
def get_order_by_number(
    order_number: str,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.variant)
            .joinedload(ProductVariant.product)
            .joinedload(Product.images),
            joinedload(Order.shipping_address)
        )
        .filter(Order.order_number == order_number, Order.member_id == current_member.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="找不到此訂單 (Order not found)")
    return order
