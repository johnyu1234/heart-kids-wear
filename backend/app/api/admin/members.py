from datetime import datetime, date
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from backend.app.database import get_db
from backend.app.models.user import Member, MemberEvent, ShippingAddress
from backend.app.models.finance import PointsCard
from backend.app.schemas.user import MemberProfileOut, MemberEventOut
from backend.app.utils.auth import get_current_admin

router = APIRouter(prefix="/admin/members", tags=["Admin: Member CRM"])

class AdminUpdateMemberRemarks(BaseModel):
    member_id: int
    admin_remarks: Optional[str] = None
    is_blacklisted: Optional[bool] = None

class AdminIssuePointsRequest(BaseModel):
    member_id: int
    amount: Decimal
    expiry_date: Optional[datetime] = None
    reason: Optional[str] = None

class AdminAddEventRequest(BaseModel):
    member_id: int
    event_type: str
    event_description: str

@router.get("", response_model=List[MemberProfileOut])
def admin_list_members(
    search: Optional[str] = Query(None, description="Search by name, member_id, email, or phone"),
    is_blacklisted: Optional[bool] = Query(None),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Member).options(joinedload(Member.shipping_addresses))
    
    if search:
        query = query.filter(
            (Member.full_name.ilike(f"%{search}%")) |
            (Member.member_id.ilike(f"%{search}%")) |
            (Member.email.ilike(f"%{search}%")) |
            (Member.phone.ilike(f"%{search}%"))
        )

    if is_blacklisted is not None:
        query = query.filter(Member.is_blacklisted == is_blacklisted)

    return query.order_by(Member.created_at.desc()).all()

@router.get("/{member_id}/events", response_model=List[MemberEventOut])
def get_member_events(
    member_id: int,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    events = (
        db.query(MemberEvent)
        .filter(MemberEvent.member_id == member_id)
        .order_by(MemberEvent.created_at.desc())
        .all()
    )
    return events

@router.post("/update-remarks")
def update_member_remarks(
    payload: AdminUpdateMemberRemarks,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="找不到會員")

    if payload.admin_remarks is not None:
        member.admin_remarks = payload.admin_remarks
    if payload.is_blacklisted is not None:
        member.is_blacklisted = payload.is_blacklisted

    db.commit()
    return {"success": True, "message": "會員標籤與狀態已更新"}

@router.post("/issue-points")
def issue_points_card(
    payload: AdminIssuePointsRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="找不到會員")

    card = PointsCard(
        member_id=member.id,
        amount=payload.amount,
        remaining=payload.amount,
        expiry_date=payload.expiry_date,
        issued_reason=payload.reason or "管理員手動贈點"
    )
    db.add(card)

    event = MemberEvent(
        member_id=member.id,
        event_date=datetime.utcnow().date(),
        event_type="NOTE",
        event_description=f"管理員發放點數卡 NT${int(payload.amount):,} 點 ({payload.reason or '特別贈送'})"
    )
    db.add(event)
    db.commit()

    return {"success": True, "message": f"已成功發放 NT${int(payload.amount):,} 點數卡"}

@router.post("/add-event")
def add_member_event(
    payload: AdminAddEventRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    member = db.query(Member).filter(Member.id == payload.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="找不到會員")

    event = MemberEvent(
        member_id=member.id,
        event_date=datetime.utcnow().date(),
        event_type=payload.event_type,
        event_description=payload.event_description
    )
    db.add(event)
    db.commit()
    return {"success": True, "message": "事件紀錄已新增"}
