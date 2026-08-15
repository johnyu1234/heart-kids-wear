from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.finance import Message, MessageTemplate
from backend.app.models.user import Member
from backend.app.models.order import Order
from backend.app.schemas.finance import (
    MessageOut, MessageTemplateOut, MessageTemplateCreate,
    MessageAdminSendIndividual, MessageAdminSendBulk
)
from backend.app.utils.auth import get_current_admin
from backend.app.services.notification_service import render_template

router = APIRouter(prefix="/admin/messages", tags=["Admin: Messaging & Broadcasts"])

@router.get("/templates", response_model=List[MessageTemplateOut])
def list_message_templates(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(MessageTemplate).order_by(MessageTemplate.created_at.asc()).all()

@router.post("/templates/create", response_model=MessageTemplateOut)
def create_message_template(
    payload: MessageTemplateCreate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    tpl = MessageTemplate(**payload.dict())
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return tpl

@router.post("/send-individual", response_model=MessageOut)
def send_individual_message(
    payload: MessageAdminSendIndividual,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    recipient = db.query(Member).filter(Member.id == payload.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="找不到收件人會員")

    msg = Message(
        sender_id=admin.id,
        recipient_id=recipient.id,
        content=payload.content,
        message_type="PERSONAL"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.post("/send-bulk")
def send_bulk_broadcast(
    payload: MessageAdminSendBulk,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    template_content = payload.custom_content
    if payload.template_id:
        tpl = db.query(MessageTemplate).filter(MessageTemplate.id == payload.template_id).first()
        if tpl:
            template_content = tpl.template_content

    if not template_content:
        raise HTTPException(status_code=400, detail="缺少訊息內容或範本")

    created_count = 0
    for r_id in payload.recipient_ids:
        member = db.query(Member).filter(Member.id == r_id).first()
        if not member:
            continue

        # Find latest tracking code for variable replacement
        latest_order = (
            db.query(Order)
            .filter(Order.member_id == member.id)
            .order_by(Order.created_at.desc())
            .first()
        )
        tracking_code = latest_order.tracking_code if latest_order else "未提供"

        ctx = {
            "name": member.full_name,
            "tracking": tracking_code,
            "month": str(datetime.utcnow().month),
            "date": datetime.utcnow().strftime("%Y/%m/%d")
        }
        if payload.placeholders:
            ctx.update(payload.placeholders)

        personalized_content = render_template(template_content, ctx)

        msg = Message(
            sender_id=admin.id,
            recipient_id=member.id,
            content=personalized_content,
            is_bulk=True,
            message_type="BULK"
        )
        db.add(msg)
        created_count += 1

    db.commit()
    return {"success": True, "dispatched_count": created_count}
