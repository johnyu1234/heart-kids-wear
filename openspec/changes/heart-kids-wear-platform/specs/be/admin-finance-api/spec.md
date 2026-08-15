## Purpose

Provides administrative endpoints for payment audit logs, manual payment confirmation, dual-currency expense ledger with freight formulas, and business revenue/profit reporting with AOV metrics.

## ADDED Requirements

### Requirement: Payment Logs and Manual Confirmation API
The backend SHALL expose `GET /api/admin/payments` (with filtering by year, month, day, and status) and `POST /api/admin/payments/confirm` to reconcile bank transfers and automatically transition order statuses to PAID.

#### Scenario: Admin Manually Confirming Payment
- **WHEN** admin posts `{ "order_id": 15, "last_5_digits": "12345" }` to `POST /api/admin/payments/confirm`
- **THEN** backend marks the payment record as CONFIRMED, updates order status to PAID, sets `payment_date = NOW()`, and logs an income ledger entry

### Requirement: Multi-Category Expense Ledger API
The backend SHALL expose `GET /api/admin/finance/expenses` and `POST /api/admin/finance/expenses/add` supporting categories (Assistant Salary, UK Local Shipping, International Freight, Packaging Consumables), GBP/TWD conversion, and volumetric freight formula calculations (`(L*W*H)/5000`).

#### Scenario: Admin Adding International Freight Expense
- **WHEN** admin posts `{ "category": "INTL_FREIGHT", "amount_gbp": 120.00, "amount_twd": 4800.00, "formula_notes": "(60*42*40)/5000 = 20.16kg" }` to `POST /api/admin/finance/expenses/add`
- **THEN** backend records the expense entry with formula metadata and returns updated monthly totals

### Requirement: Revenue, Profit, and AOV Analytics Report API
The backend SHALL expose `GET /api/admin/reports` accepting date range filters and computing: total orders, total items, shipping costs, procurement costs, gross sales (with/without shipping), net profit, and Average Order Value (`Gross Sales / Total Orders`).

#### Scenario: Generating Filtered Revenue Report
- **WHEN** admin requests `GET /api/admin/reports?start_date=2026-04-01&end_date=2026-04-30`
- **THEN** backend aggregates transaction records and returns the financial metrics array including AOV calculation
