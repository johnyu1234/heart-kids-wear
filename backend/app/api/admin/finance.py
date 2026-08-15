from datetime import datetime, date
from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models.order import Order, OrderItem, PaymentRecord
from backend.app.models.product import Product, ProductVariant
from backend.app.models.user import Member
from backend.app.models.finance import ExpenseLedger, IncomeLedger
from backend.app.schemas.finance import (
    PaymentRecordOut, PaymentConfirmRequest,
    ExpenseLedgerCreate, ExpenseLedgerOut,
    IncomeLedgerCreate, IncomeLedgerOut,
    FinancialReportSummary
)
from backend.app.utils.auth import get_current_admin

router = APIRouter(prefix="/admin/finance", tags=["Admin: Finance & Ledgers"])

@router.get("/payments", response_model=List[PaymentRecordOut])
def list_payment_records(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(PaymentRecord)
    if status:
        query = query.filter(PaymentRecord.status == status)
    if year:
        query = query.filter(func.strftime('%Y', PaymentRecord.created_at) == str(year))
    if month:
        query = query.filter(func.strftime('%m', PaymentRecord.created_at) == f"{month:02d}")
    return query.order_by(PaymentRecord.created_at.desc()).all()

@router.post("/payments/confirm")
def confirm_payment(
    payload: PaymentConfirmRequest,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到訂單")

    now = datetime.utcnow()
    order.status = "PAID"
    order.payment_date = now
    order.is_overdue = False
    order.overdue_stage = 0

    # Record or update payment record
    pay_rec = db.query(PaymentRecord).filter(PaymentRecord.order_id == order.id).first()
    if pay_rec:
        pay_rec.status = "CONFIRMED"
        pay_rec.paid_at = now
        if payload.last_5_digits:
            pay_rec.last_5_digits = payload.last_5_digits
    else:
        pay_rec = PaymentRecord(
            order_id=order.id,
            member_id=order.member_id,
            amount=order.total,
            payment_method=payload.payment_method,
            last_5_digits=payload.last_5_digits,
            status="CONFIRMED",
            paid_at=now
        )
        db.add(pay_rec)

    # Add to income ledger
    income = IncomeLedger(
        entry_date=now.date(),
        member_id=order.member_id,
        order_id=order.id,
        amount_twd=order.total,
        remarks=f"訂單 {order.order_number} 結帳入帳 (末5碼: {payload.last_5_digits or '無'})"
    )
    db.add(income)

    db.commit()
    return {"success": True, "message": f"訂單 {order.order_number} 已成功確認入帳"}

# Expense Ledger
@router.get("/expenses", response_model=List[ExpenseLedgerOut])
def list_expenses(
    category: Optional[str] = Query(None),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(ExpenseLedger)
    if category:
        query = query.filter(ExpenseLedger.category == category)
    return query.order_by(ExpenseLedger.entry_date.desc()).all()

@router.post("/expenses/add", response_model=ExpenseLedgerOut)
def add_expense_entry(
    payload: ExpenseLedgerCreate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    entry = ExpenseLedger(**payload.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

# Income Ledger
@router.get("/income", response_model=List[IncomeLedgerOut])
def list_income(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(IncomeLedger).order_by(IncomeLedger.entry_date.desc()).all()

@router.post("/income/add", response_model=IncomeLedgerOut)
def add_income_entry(
    payload: IncomeLedgerCreate,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    entry = IncomeLedger(**payload.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

# Analytics & Reports Dashboard
@router.get("/reports", response_model=FinancialReportSummary)
def get_financial_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not start_date:
        start_date = date(datetime.utcnow().year, datetime.utcnow().month, 1)
    if not end_date:
        end_date = datetime.utcnow().date()

    orders = (
        db.query(Order)
        .filter(
            func.date(Order.created_at) >= start_date,
            func.date(Order.created_at) <= end_date,
            Order.status != "CANCELLED",
            Order.status != "ABANDONED"
        )
        .all()
    )

    total_orders = len(orders)
    total_items = 0
    gross_with_shipping = Decimal("0.00")
    gross_without_shipping = Decimal("0.00")
    procurement_cost_twd = Decimal("0.00")
    status_counts = {}

    for ord in orders:
        gross_with_shipping += ord.total
        gross_without_shipping += ord.subtotal - ord.discount_amount
        status_counts[ord.status] = status_counts.get(ord.status, 0) + 1

        for it in ord.items:
            total_items += it.quantity
            # Approximate procurement cost from GBP cost * approx exchange rate 40
            cost_gbp = it.variant.product.cost_gbp or Decimal("0.00")
            procurement_cost_twd += cost_gbp * Decimal("40.00") * it.quantity

    # Total Operational Expenses
    expenses = (
        db.query(ExpenseLedger)
        .filter(ExpenseLedger.entry_date >= start_date, ExpenseLedger.entry_date <= end_date)
        .all()
    )
    total_operational = sum(e.amount_twd for e in expenses)

    net_profit = gross_without_shipping - procurement_cost_twd - total_operational
    aov = (gross_with_shipping / total_orders) if total_orders > 0 else Decimal("0.00")

    return FinancialReportSummary(
        start_date=start_date,
        end_date=end_date,
        total_orders_count=total_orders,
        total_items_sold=total_items,
        gross_revenue_with_shipping=gross_with_shipping,
        gross_revenue_without_shipping=gross_without_shipping,
        total_procurement_cost_twd=procurement_cost_twd,
        total_operational_expenses_twd=total_operational,
        net_profit_twd=net_profit,
        average_order_value_aov=aov,
        orders_by_status=status_counts
    )
