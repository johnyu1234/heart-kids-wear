from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.order import OrderItem, Order
from backend.app.models.user import Member, MemberEvent
from backend.app.models.finance import Message

def process_discontinued_item_refund(db: Session, order_item: OrderItem) -> Decimal:
    """
    When an admin sets an item to OUT_OF_STOCK / discontinued,
    automatically refund 100% of the price into the member's store_credits,
    log a STOCKOUT_REFUND event, and send a notification message.
    """
    order = db.query(Order).filter(Order.id == order_item.order_id).first()
    if not order:
        return Decimal("0.00")
    
    member = db.query(Member).filter(Member.id == order.member_id).first()
    if not member:
        return Decimal("0.00")

    refund_amount = order_item.unit_price * order_item.quantity

    # 1. Update Member Store Credits (永久有效)
    member.store_credits = (member.store_credits or Decimal("0.00")) + refund_amount

    # 2. Record Event in Member Timeline
    event = MemberEvent(
        member_id=member.id,
        event_date=datetime.utcnow().date(),
        event_type="STOCKOUT_REFUND",
        event_description=(
            f"訂單 {order.order_number} 商品【{order_item.variant.product.name_zh} "
            f"規格: {order_item.variant.size_label}】英國原廠斷貨，"
            f"已自動退還購物金 NT${int(refund_amount):,} 元至會員帳戶。"
        )
    )
    db.add(event)

    # 3. Send In-App Notification Message
    msg = Message(
        sender_id=None,  # System
        recipient_id=member.id,
        content=(
            f"【斷貨退款通知】親愛的 {member.full_name} 您好：您訂單 {order.order_number} "
            f"中的商品【{order_item.variant.product.name_zh} {order_item.variant.size_label}】"
            f"因英國原廠缺貨已轉為斷貨。系統已自動將款項 NT${int(refund_amount):,} "
            f"退至您的購物金帳戶（永久有效，下次結帳自動折抵）。造成不便敬請見諒！🙇‍♀️"
        ),
        message_type="SYSTEM"
    )
    db.add(msg)
    db.commit()

    return refund_amount
