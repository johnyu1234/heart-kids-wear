from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.finance import Message
from backend.app.models.user import Member
from backend.app.schemas.finance import MessageOut, MessageSendRequest, UnreadCountOut
from backend.app.utils.auth import get_current_member
from backend.app.services.notification_service import send_automated_welcome_message

router = APIRouter(prefix="/messages", tags=["Customer Messaging"])

@router.get("", response_model=List[MessageOut])
def get_messages(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    messages = (
        db.query(Message)
        .filter(
            (Message.recipient_id == current_member.id) |
            (Message.sender_id == current_member.id)
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages

@router.post("/send", response_model=MessageOut)
def send_message(
    payload: MessageSendRequest,
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    # 1. Check if user already has prior messages
    prior_count = db.query(Message).filter(Message.sender_id == current_member.id).count()

    # 2. Save user message
    msg = Message(
        sender_id=current_member.id,
        recipient_id=1,  # Admin
        content=payload.content,
        message_type="PERSONAL"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # 3. If first message, trigger automated canned welcome reply
    if prior_count == 0:
        send_automated_welcome_message(db, current_member)

    return msg

@router.get("/unread-count", response_model=UnreadCountOut)
def get_unread_count(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    count = (
        db.query(Message)
        .filter(Message.recipient_id == current_member.id, Message.is_read == False)
        .count()
    )
    return UnreadCountOut(unread_count=count)

@router.post("/mark-read")
def mark_messages_read(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db)
):
    db.query(Message).filter(
        Message.recipient_id == current_member.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "已標記為已讀"}
