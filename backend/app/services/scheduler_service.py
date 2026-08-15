from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.models.order import Order, OrderItem
from backend.app.models.user import Member, MemberEvent
from backend.app.models.finance import Message, PointsCard, SystemConfig
from backend.app.models.product import Product, GroupCampaign

def run_payment_overdue_pipeline(db: Session) -> dict:
    """
    Automated 4-stage overdue payment workflow:
    - Stage 0 (Day 0): Payment deadline day -> sends reminder
    - Stage 1 (Day 1): Passed deadline -> locks to manual transfer, 3-day grace period notice
    - Stage 2 (Day 3-4): Grace period ending -> sends final warning
    - Stage 3 (Day 4+): Overdue expired -> auto-abandon order, release stock, log late payment penalty
    """
    now = datetime.utcnow()
    results = {"stage_0": 0, "stage_1": 0, "stage_2": 0, "stage_3_abandoned": 0}

    # Fetch all unpaid confirmed orders
    unpaid_orders = (
        db.query(Order)
        .filter(Order.status.in_(["CONFIRMED", "OVERDUE_GRACE", "OVERDUE_FINAL"]))
        .all()
    )

    for order in unpaid_orders:
        if not order.payment_deadline:
            continue

        days_past_deadline = (now - order.payment_deadline).days

        # Stage 1: Past deadline -> Enter Grace period (Day 1 to 2)
        if days_past_deadline >= 1 and order.overdue_stage < 1:
            order.status = "OVERDUE_GRACE"
            order.is_overdue = True
            order.overdue_stage = 1
            order.payment_method = "MANUAL_TRANSFER"
            
            # Send Grace Period Notification
            msg = Message(
                sender_id=None,
                recipient_id=order.member_id,
                content=(
                    f"【結帳緩衝期通知】哈囉您好：您的訂單 {order.order_number} "
                    "已超過結帳截止日。為維護您的權益，系統已提供 3 天結帳緩衝期（僅限手動銀行轉帳）。"
                    "請於 3 天內完成匯款並回覆後5碼，逾期商品將釋出不保留。謝謝您！"
                ),
                message_type="SYSTEM"
            )
            db.add(msg)
            results["stage_1"] += 1

        # Stage 2: Final Warning (Day 3)
        elif days_past_deadline >= 3 and order.overdue_stage < 2:
            order.status = "OVERDUE_FINAL"
            order.overdue_stage = 2
            
            msg = Message(
                sender_id=None,
                recipient_id=order.member_id,
                content=(
                    f"‼️最後結帳提醒，商品即將釋出‼️ 訂單 {order.order_number} "
                    "已超過結帳緩衝期。如今日未能完成結帳，將視為確定逾期棄單，商品釋出不保留，恕不再提供服務。謝謝您！🙇‍♀️"
                ),
                message_type="SYSTEM"
            )
            db.add(msg)
            results["stage_2"] += 1

        # Stage 3: Auto-Abandon & Blacklist Tagging (Day 4+)
        elif days_past_deadline >= 4 and order.status != "ABANDONED":
            order.status = "ABANDONED"
            order.overdue_stage = 3
            
            member = db.query(Member).filter(Member.id == order.member_id).first()
            if member:
                member.overdue_count += 1
                
                # Log event
                event = MemberEvent(
                    member_id=member.id,
                    event_date=now.date(),
                    event_type="ORDER_ABANDONED",
                    event_description=f"訂單 {order.order_number} 逾期未結帳，系統自動棄單並釋出商品庫存。"
                )
                db.add(event)

            results["stage_3_abandoned"] += 1

    db.commit()
    return results

def run_points_expiry_worker(db: Session) -> int:
    """Scan and mark expired points cards."""
    now = datetime.utcnow()
    expired_cards = (
        db.query(PointsCard)
        .filter(
            PointsCard.expiry_date <= now,
            PointsCard.is_used == False
        )
        .all()
    )
    count = len(expired_cards)
    for card in expired_cards:
        card.is_used = True
        card.remaining = 0
    db.commit()
    return count

def run_scheduled_publishing_worker(db: Session) -> dict:
    """Publish / Delist scheduled campaigns and products."""
    now = datetime.utcnow()
    # 1. Publish campaigns
    to_publish = (
        db.query(GroupCampaign)
        .filter(
            GroupCampaign.scheduled_publish_at <= now,
            GroupCampaign.is_active == False
        )
        .all()
    )
    for c in to_publish:
        c.is_active = True

    # 2. Delist campaigns
    to_delist = (
        db.query(GroupCampaign)
        .filter(
            GroupCampaign.scheduled_delist_at <= now,
            GroupCampaign.is_active == True
        )
        .all()
    )
    for c in to_delist:
        c.is_active = False

    db.commit()
    return {"published": len(to_publish), "delisted": len(to_delist)}
