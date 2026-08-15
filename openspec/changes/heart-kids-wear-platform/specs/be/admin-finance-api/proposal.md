# Proposal: Financial Ledgers & Analytics API (BE)

## Why
Admins must reconcile payments with year/month/day/time filters, log monthly operational expenses in GBP and TWD (with volumetric freight formulas `(L*W*H)/5000`), and view revenue and profit reports with Average Order Value (AOV) calculations.

## What Changes
- Payment logs and manual confirmation (`GET /api/admin/payments`, `POST /api/admin/payments/confirm`).
- Multi-category monthly expense ledger (`GET /api/admin/finance/expenses`, `POST /api/admin/finance/expenses/add`).
- Income ledger (`GET /api/admin/finance/income`, `POST /api/admin/finance/income/add`).
- Financial analytics reporting (`GET /api/admin/reports`) with date range filtering and AOV metrics.

## Impact
- Manages all financial reconciliation and business analytics reporting.
