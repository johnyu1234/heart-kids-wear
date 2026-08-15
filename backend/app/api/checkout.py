from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.order import CartItem, Order, OrderItem, PaymentRecord
from backend.app.models.user import Member, ShippingAddress
from backend.app.models.finance import PointsCard, IncomeLedger
from backend.app.models.product import ProductVariant, Product
from backend.app.schemas.order import (
    CheckoutCalculateRequest, CheckoutCalculateResponse,
    CheckoutSubmitRequest, OrderOut
)
from backend.app.utils.auth import get_current_member
from backend.app.utils.id_generators import generate_order_number
from backend.app.services.checkout_service import calculate_checkout

router = APIRouter(prefix="/checkout", tags=["Checkout & Pre-Order Submission"])

@router.post("/calculate", response_model=CheckoutCalculateResponse)
def calculate_checkout_fees(
    payload: CheckoutCalculateRequest,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.variant).joinedload(ProductVariant.product))
        .filter(CartItem.member_id == current_member.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="購物車為空 (Cart is empty)")

    calc = calculate_checkout(
        db,
        current_member,
        cart_items,
        requested_shipping_type=payload.shipping_type,
        use_store_credits=payload.use_store_credits,
        points_card_id=payload.points_card_id
    )

    return CheckoutCalculateResponse(**calc)

@router.post("/submit", response_model=OrderOut)
def submit_preorder(
    payload: CheckoutSubmitRequest,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    if not payload.agreed_to_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="請勾選我同意且會配合心童裝的購物規則"
        )

    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.variant).joinedload(ProductVariant.product))
        .filter(CartItem.member_id == current_member.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="購物車為空無法結帳")

    # 1. Calculate live fees
    calc = calculate_checkout(
        db,
        current_member,
        cart_items,
        requested_shipping_type=payload.shipping_type,
        use_store_credits=payload.use_store_credits,
        points_card_id=payload.points_card_id
    )

    # 2. Shipping Address resolution
    shipping_addr_id = payload.shipping_address_id
    if not shipping_addr_id and (payload.store_name or payload.full_address):
        new_addr = ShippingAddress(
            member_id=current_member.id,
            address_type=calc["shipping_type"],
            store_name=payload.store_name,
            store_number=payload.store_number,
            recipient_name=payload.recipient_name or current_member.full_name,
            recipient_phone=payload.recipient_phone or current_member.phone,
            full_address=payload.full_address,
            is_primary=False
        )
        db.add(new_addr)
        db.flush()
        shipping_addr_id = new_addr.id

    # 3. Create Order
    now = datetime.utcnow()
    new_order_number = generate_order_number(db, now)
    payment_deadline = now + timedelta(days=3)  # Default 3 days payment deadline

    order = Order(
        order_number=new_order_number,
        member_id=current_member.id,
        status="CONFIRMED",
        shipping_type=calc["shipping_type"],
        shipping_address_id=shipping_addr_id,
        subtotal=calc["subtotal"],
        shipping_fee=calc["shipping_fee"],
        discount_amount=calc["bulk_discount_applied"],
        credits_used=calc["credits_to_deduct"],
        points_used=calc["points_to_deduct"],
        total=calc["final_payable_amount"],
        payment_method="VIRTUAL_ACCOUNT",
        payment_deadline=payment_deadline,
        travel_notes=payload.travel_notes,
        customer_notes=payload.customer_notes,
        created_at=now
    )
    db.add(order)
    db.flush()

    # 4. Create Order Items with preorder_submitted_at timestamp
    for c_item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            variant_id=c_item.variant_id,
            quantity=c_item.quantity,
            unit_price=c_item.variant.product.retail_price_twd,
            preorder_status="IN_PROGRESS",
            customer_remarks="已收到預購需求，採購中",
            preorder_submitted_at=now
        )
        db.add(order_item)

    # 5. Deduct Store Credits
    if calc["credits_to_deduct"] > 0:
        current_member.store_credits -= calc["credits_to_deduct"]

    # 6. Deduct Points Card
    if payload.points_card_id and calc["points_to_deduct"] > 0:
        card = db.query(PointsCard).filter(PointsCard.id == payload.points_card_id).first()
        if card:
            card.remaining -= calc["points_to_deduct"]
            if card.remaining <= 0:
                card.is_used = True

    # 7. Update member purchase count
    current_member.total_purchases += 1

    # 8. Create Payment Record Log
    payment_record = PaymentRecord(
        order_id=order.id,
        member_id=current_member.id,
        amount=calc["final_payable_amount"],
        payment_method="VIRTUAL_ACCOUNT",
        virtual_account_number=f"9988{order.order_number}",
        status="PENDING"
    )
    db.add(payment_record)

    # 9. Clear Cart
    db.query(CartItem).filter(CartItem.member_id == current_member.id).delete()

    db.commit()
    db.refresh(order)

    return order

@router.get("/payment-status")
def get_payment_status(order_number: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到此訂單")
    return {
        "order_number": order.order_number,
        "status": order.status,
        "total": order.total,
        "payment_method": order.payment_method,
        "payment_deadline": order.payment_deadline,
        "is_paid": order.status in ["PAID", "PROCESSING", "SHIPPED_TO_TW", "ARRIVED_TW", "SHIPPED_TO_CUSTOMER", "DELIVERED"]
    }
