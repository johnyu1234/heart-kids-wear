from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.order import Wishlist
from backend.app.models.product import Product
from backend.app.models.user import Member
from backend.app.schemas.product import WishlistOut, WishlistAddRequest, WishlistRemoveRequest
from backend.app.utils.auth import get_current_member

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[WishlistOut])
def get_wishlist(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    items = (
        db.query(Wishlist)
        .options(joinedload(Wishlist.product).joinedload(Product.images))
        .filter(Wishlist.member_id == current_member.id)
        .order_by(Wishlist.added_at.desc())
        .all()
    )
    return items

@router.post("/add")
def add_to_wishlist(
    payload: WishlistAddRequest,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.member_id == current_member.id, Wishlist.product_id == payload.product_id)
        .first()
    )
    if not existing:
        item = Wishlist(member_id=current_member.id, product_id=payload.product_id)
        db.add(item)
        db.commit()
    return {"success": True, "message": "已加入願望清單"}

@router.post("/remove")
def remove_from_wishlist(
    payload: WishlistRemoveRequest,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    db.query(Wishlist).filter(
        Wishlist.member_id == current_member.id,
        Wishlist.product_id == payload.product_id
    ).delete()
    db.commit()
    return {"success": True, "message": "已從願望清單移除"}
