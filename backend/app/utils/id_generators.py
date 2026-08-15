from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.order import Order
from backend.app.models.user import Member

def generate_order_number(db: Session, dt: datetime = None) -> str:
    """
    Generate order number in format: YYMM + 4-digit sequential integer.
    Example: 26040001 (1st order in April 2026)
    """
    if dt is None:
        dt = datetime.utcnow()
    
    yymm = dt.strftime("%y%m")
    prefix = yymm

    # Query latest order with this prefix
    latest = (
        db.query(Order.order_number)
        .filter(Order.order_number.like(f"{prefix}%"))
        .order_by(Order.order_number.desc())
        .first()
    )

    if latest and latest[0]:
        try:
            seq_str = latest[0][4:]
            seq = int(seq_str) + 1
        except Exception:
            seq = 1
    else:
        seq = 1

    return f"{prefix}{seq:04d}"

def generate_member_id(db: Session, dt: datetime = None) -> str:
    """
    Generate member ID in format: YYMM + 3-digit sequential integer.
    Example: 2604004 (4th member in April 2026)
    """
    if dt is None:
        dt = datetime.utcnow()

    yymm = dt.strftime("%y%m")
    prefix = yymm

    latest = (
        db.query(Member.member_id)
        .filter(Member.member_id.like(f"{prefix}%"))
        .order_by(Member.member_id.desc())
        .first()
    )

    if latest and latest[0]:
        try:
            seq_str = latest[0][4:]
            seq = int(seq_str) + 1
        except Exception:
            seq = 1
    else:
        seq = 1

    return f"{prefix}{seq:03d}"

def generate_sku(product_id: int, size: str, color: str = None) -> str:
    """Generate default SKU if not supplied."""
    clean_size = size.upper().replace(" ", "").replace("-", "") if size else "STD"
    clean_color = color.upper()[:3] if color else "DEF"
    return f"SKU-{product_id:04d}-{clean_size}-{clean_color}"
