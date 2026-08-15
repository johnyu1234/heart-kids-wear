from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import Member, ShippingAddress
from backend.app.models.finance import PointsCard
from backend.app.schemas.user import (
    MemberProfileOut, MemberProfileUpdate,
    PointsCardOut, ShippingAddressOut, ShippingAddressCreate
)
from backend.app.utils.auth import get_current_member, hash_password

router = APIRouter(prefix="/members", tags=["Member Portal"])

@router.get("/profile", response_model=MemberProfileOut)
def get_member_profile(current_member: Member = Depends(get_current_member)):
    return current_member

@router.post("/profile/update", response_model=MemberProfileOut)
def update_member_profile(
    payload: MemberProfileUpdate,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    # Prohibit changing full_name (legal name is immutable per spec)
    if payload.phone is not None:
        current_member.phone = payload.phone
    if payload.contact_address is not None:
        current_member.contact_address = payload.contact_address
    if payload.ig_handle is not None:
        current_member.ig_handle = payload.ig_handle
    if payload.fb_handle is not None:
        current_member.fb_handle = payload.fb_handle
    if payload.line_handle is not None:
        current_member.line_handle = payload.line_handle
    if payload.email is not None:
        clean_email = payload.email.lower().strip()
        existing = db.query(Member).filter(Member.email == clean_email, Member.id != current_member.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="此 Email 已被其他帳號使用")
        current_member.email = clean_email
    if payload.new_password:
        current_member.password_hash = hash_password(payload.new_password)

    # Replace / Update addresses if provided
    if payload.shipping_addresses is not None:
        # Remove existing and recreate
        db.query(ShippingAddress).filter(ShippingAddress.member_id == current_member.id).delete()
        for addr_data in payload.shipping_addresses:
            new_addr = ShippingAddress(
                member_id=current_member.id,
                **addr_data.dict()
            )
            db.add(new_addr)

    db.commit()
    db.refresh(current_member)
    return current_member

@router.get("/points", response_model=List[PointsCardOut])
def get_member_points(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    cards = (
        db.query(PointsCard)
        .filter(PointsCard.member_id == current_member.id)
        .order_by(PointsCard.created_at.desc())
        .all()
    )
    return cards

@router.get("/credits")
def get_member_credits(current_member: Member = Depends(get_current_member)):
    return {
        "store_credits": current_member.store_credits or Decimal("0.00"),
        "note": "購物金永久有效，結帳時可全額自動折抵。"
    }
