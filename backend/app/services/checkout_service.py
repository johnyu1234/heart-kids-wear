from decimal import Decimal
from typing import List, Tuple
from sqlalchemy.orm import Session
from backend.app.models.order import CartItem
from backend.app.models.product import ProductVariant, Product
from backend.app.models.finance import SystemConfig, PointsCard
from backend.app.models.user import Member

def get_system_config(db: Session, key: str, default: str) -> str:
    cfg = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
    return cfg.config_value if cfg else default

def calculate_checkout(
    db: Session,
    member: Member,
    cart_items: List[CartItem],
    requested_shipping_type: str = "SEVEN_ELEVEN",
    use_store_credits: bool = True,
    points_card_id: int = None
) -> dict:
    total_items = sum(item.quantity for item in cart_items)
    subtotal = sum(item.variant.product.retail_price_twd * item.quantity for item in cart_items)

    # Configs
    max_711_items = int(get_system_config(db, "MAX_ITEMS_711", "15"))
    fee_711 = Decimal(get_system_config(db, "SHIPPING_FEE_711", "60.00"))
    fee_post = Decimal(get_system_config(db, "SHIPPING_FEE_POST", "80.00"))
    bulk_threshold = Decimal(get_system_config(db, "BULK_DISCOUNT_THRESHOLD", "4000.00"))
    bulk_discount_val = Decimal(get_system_config(db, "BULK_DISCOUNT_AMOUNT", "60.00"))

    # Shipping Lock Logic
    is_shipping_locked_post = total_items > max_711_items
    effective_shipping_type = "POST_OFFICE" if is_shipping_locked_post else requested_shipping_type
    shipping_fee = fee_post if effective_shipping_type == "POST_OFFICE" else fee_711

    # Bulk Discount Logic (NT$4,000 threshold on subtotal excluding shipping)
    bulk_discount_applied = bulk_discount_val if subtotal >= bulk_threshold else Decimal("0.00")

    # Amount after item discount
    current_amount = subtotal - bulk_discount_applied + shipping_fee

    # Store Credits Deduction (Auto applied if requested)
    available_credits = member.store_credits or Decimal("0.00")
    credits_to_deduct = Decimal("0.00")
    if use_store_credits and available_credits > 0:
        credits_to_deduct = min(available_credits, current_amount)
        current_amount -= credits_to_deduct

    # Points Card Deduction (Max 1 card per transaction)
    available_points = Decimal("0.00")
    points_to_deduct = Decimal("0.00")
    if points_card_id:
        card = (
            db.query(PointsCard)
            .filter(
                PointsCard.id == points_card_id,
                PointsCard.member_id == member.id,
                PointsCard.is_used == False,
                PointsCard.remaining > 0
            )
            .first()
        )
        if card:
            available_points = card.remaining
            points_to_deduct = min(available_points, current_amount)
            current_amount -= points_to_deduct

    final_payable_amount = max(Decimal("0.00"), current_amount)

    return {
        "total_items": total_items,
        "subtotal": subtotal,
        "shipping_type": effective_shipping_type,
        "shipping_fee": shipping_fee,
        "is_shipping_locked_post": is_shipping_locked_post,
        "bulk_discount_applied": bulk_discount_applied,
        "available_store_credits": available_credits,
        "credits_to_deduct": credits_to_deduct,
        "available_points": available_points,
        "points_to_deduct": points_to_deduct,
        "final_payable_amount": final_payable_amount
    }
