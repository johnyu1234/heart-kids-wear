from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.finance import Message, MessageTemplate
from backend.app.models.user import Member

def render_template(template_str: str, context: dict) -> str:
    rendered = template_str
    for key, value in context.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", str(value if value is not None else ""))
    return rendered

def send_automated_welcome_message(db: Session, member: Member) -> Message:
    """Send standard welcome message when customer starts a chat."""
    tpl = (
        db.query(MessageTemplate)
        .filter(MessageTemplate.template_name == "線上客服自動歡迎回覆")
        .first()
    )
    if tpl:
        content = render_template(tpl.template_content, {"name": member.full_name})
    else:
        content = (
            f"{member.full_name} 您好！歡迎光臨心童裝Heart Kids Wear。如果有任何問題請直接留言，"
            "我們會盡速回覆。💌 回覆順序由舊到新依序回覆，請勿重複留言，重複留言會讓順序往後推喔！謝謝！🙇🏻‍♀️"
        )

    msg = Message(
        sender_id=None,
        recipient_id=member.id,
        content=content,
        message_type="AUTO_REPLY"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
