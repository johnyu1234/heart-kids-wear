# Proposal: Admin Management Panel (FE)

## Why
Admins need a dedicated 10-view operational suite matching the exact navigation structure of the specification: product import, category scheduling, 4-tab procurement manager, all orders filter, split-screen variant allocation, member CRM with behavior tagging, broadcast messaging, payment logs, expense ledger with formulas, and revenue/profit reports.

## What Changes
- `AdminSidebar` with sequential menu order (1. 匯入商品, 2. 目錄管理, 3. 商品管理, 4. 所有訂單, 5. 會員資料, 6. 訊息管理, 7. 付款紀錄, 8. 成本與收支, 9. 營業額報表).
- `ImportProductsPage` (2-tier categories, hidden brand campaigns, size chart upload, variant generator).
- `CategoryManagementPage` (scheduled publishing, one-click archive/relaunch).
- `ProductManagementPage` (4 tabs: 未訂貨 / 未到貨 / 未出貨 / 處理中 + Order on Behalf).
- `AllOrdersPage` and `OrderAllocationPage` (split-screen view, batch date logging `2026/06/07(1)`, color tags, dual remarks).
- `MemberCRMPage` (search `2604004`, behavior tags, event timeline).
- `MessagingPage` (templates, dynamic variable injection).
- `PaymentLogsPage`, `ExpenseLedgerPage` (freight formulas), `ReportsDashboardPage` (AOV metrics).

## Impact
- Powers all store administrative, sourcing, fulfillment, and financial operations.
