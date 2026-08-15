from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.order import CartItem
from backend.app.models.product import ProductVariant, Product
from backend.app.models.user import Member
from backend.app.schemas.order import CartItemAdd, CartItemUpdate, CartItemRemove, CartSummaryOut, CartItemOut
from backend.app.utils.auth import get_current_member
from backend.app.services.checkout_service import calculate_checkout

router = APIRouter(prefix="/cart", tags=["Shopping Cart"])

@router.get("", response_model=CartSummaryOut)
def get_cart_summary(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    cart_items = (
        db.query(CartItem)
        .options(
            joinedload(CartItem.variant)
            .joinedload(ProductVariant.product)
            .joinedload(Product.images)
        )
        .filter(CartItem.member_id == current_member.id)
        .order_by(CartItem.added_at.desc())
        .all()
    )

    calc = calculate_checkout(db, current_member, cart_items)

    return CartSummaryOut(
        items=cart_items,
        total_items=calc["total_items"],
        subtotal=calc["subtotal"],
        bulk_discount=calc["bulk_discount_applied"],
        estimated_shipping=calc["shipping_fee"],
        estimated_total=calc["subtotal"] - calc["bulk_discount_applied"] + calc["shipping_fee"]
    )

@router.post("/add")
def add_to_cart(
    payload: CartItemAdd,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    variant = db.query(ProductVariant).filter(ProductVariant.id == payload.variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="找不到此商品規格 (Variant not found)")

    cart_item = (
        db.query(CartItem)
        .filter(CartItem.member_id == current_member.id, CartItem.variant_id == payload.variant_id)
        .first()
    )

    if cart_item:
        cart_item.quantity += payload.quantity
    else:
        cart_item = CartItem(
            member_id=current_member.id,
            variant_id=payload.variant_id,
            quantity=payload.quantity
        )
        db.add(cart_item)

    db.commit()
    return {"success": True, "message": "已加入購物車"}

@router.post("/update")
def update_cart_item(
    payload: CartItemUpdate,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == payload.cart_item_id, CartItem.member_id == current_member.id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=404, detail="找不到此購物車項目")

    if payload.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = payload.quantity

    db.commit()
    return {"success": True, "message": "購物車已更新"}

@router.post("/remove")
def remove_cart_item(
    payload: CartItemRemove,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    db.query(CartItem).filter(
        CartItem.id == payload.cart_item_id,
        CartItem.member_id == current_member.id
    ).delete()
    db.commit()
    return {"success": True, "message": "已自購物車移除"}
