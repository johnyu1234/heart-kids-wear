from datetime import datetime, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import Member, ShippingAddress
from backend.app.models.finance import PointsCard, SystemConfig
from backend.app.schemas.user import MemberRegister, MemberLogin, TokenResponse, ForgotPasswordRequest, VerifyCodeRequest
from backend.app.utils.auth import hash_password, verify_password, create_access_token
from backend.app.utils.id_generators import generate_member_id

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_member(payload: MemberRegister, db: Session = Depends(get_db)):
    # 1. Normalize email
    clean_email = payload.email.lower().strip()
    
    # 2. Check existing user
    existing = db.query(Member).filter(Member.email == clean_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="此 Email 已被註冊 (Email already registered)"
        )

    # 3. Create Member
    new_member_id = generate_member_id(db)
    member = Member(
        member_id=new_member_id,
        email=clean_email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        date_of_birth=payload.date_of_birth,
        phone=payload.phone,
        contact_address=payload.contact_address,
        ig_handle=payload.ig_handle,
        fb_handle=payload.fb_handle,
        line_handle=payload.line_handle,
        marketing_source=payload.marketing_source,
        agreed_to_rules=payload.agreed_to_rules,
        remember_me=payload.remember_me
    )
    db.add(member)
    db.flush()

    # 4. Create primary 7-11 shipping address if provided
    if payload.store_name or payload.store_number:
        addr = ShippingAddress(
            member_id=member.id,
            address_type="SEVEN_ELEVEN",
            store_name=payload.store_name,
            store_number=payload.store_number,
            recipient_name=payload.recipient_name or payload.full_name,
            recipient_phone=payload.recipient_phone or payload.phone,
            is_primary=True
        )
        db.add(addr)

    # 5. Issue 60-Point Registration Bonus Card
    bonus_points = Decimal("60.00")
    bonus_card = PointsCard(
        member_id=member.id,
        amount=bonus_points,
        remaining=bonus_points,
        expiry_date=datetime.utcnow() + timedelta(days=90),
        issued_reason="註冊首次贈送60點 (=7-11免運費)"
    )
    db.add(bonus_card)

    db.commit()
    db.refresh(member)

    token = create_access_token(subject=member.id)
    return TokenResponse(
        access_token=token,
        is_admin=member.is_admin,
        member_id=member.member_id,
        full_name=member.full_name,
        email=member.email
    )

@router.post("/login", response_model=TokenResponse)
def login_member(payload: MemberLogin, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    member = db.query(Member).filter(Member.email == clean_email).first()

    if not member or not verify_password(payload.password, member.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="登入錯誤請再嘗試一次。(Login error, please try again.)"
        )
    
    if member.is_blacklisted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="此帳號已停用，請聯繫客服 (Account suspended)"
        )

    # Calculate expiry
    expires_delta = timedelta(days=30) if payload.remember_me else timedelta(days=7)
    token = create_access_token(subject=member.id, expires_delta=expires_delta)

    return TokenResponse(
        access_token=token,
        is_admin=member.is_admin,
        member_id=member.member_id,
        full_name=member.full_name,
        email=member.email
    )

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    member = db.query(Member).filter(Member.email == clean_email).first()
    if not member:
        return {"success": True, "message": "若此信箱已註冊，重設密碼驗證碼已發送至您的信箱。"}

    # Mock 6-digit verification code
    return {
        "success": True,
        "message": f"驗證碼已發送至 {clean_email}",
        "mock_code": "888888"  # Development mock code
    }

@router.post("/verify-code")
def verify_code(payload: VerifyCodeRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    member = db.query(Member).filter(Member.email == clean_email).first()
    if not member:
        raise HTTPException(status_code=404, detail="找不到帳號 (Account not found)")

    if payload.code != "888888":
        raise HTTPException(status_code=400, detail="驗證碼錯誤 (Invalid verification code)")

    member.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"success": True, "message": "密碼已重設成功，請重新登入。"}
