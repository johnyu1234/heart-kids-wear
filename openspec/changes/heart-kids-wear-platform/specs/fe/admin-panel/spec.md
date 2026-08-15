## Purpose

Specifies the comprehensive 10-page administrative management panel covering product import, categories, procurement tabs, split-screen order allocation, member CRM, message templates, and financial ledgers.

## ADDED Requirements

### Requirement: Admin Navigation Sidebar Structure
The admin panel SHALL implement a sidebar menu matching the exact sequential order from the specification: 1. 匯入商品, 2. 目錄管理, 3. 商品管理/單品訂貨, 4. 所有訂單, 5. 會員資料, 6. 訊息管理, 7. 付款紀錄, 8. 成本與收支, 9. 營業額報表.

#### Scenario: Navigating Admin Sidebar
- **WHEN** admin clicks "商品管理 / 單品訂貨" in the sidebar
- **THEN** application loads the 4-tab procurement management interface

### Requirement: Split-Screen Inventory Allocation Interface
The Allocation interface SHALL present a split-screen layout: left panel displaying variant specifications and quantities (unfulfilled vs fulfilled), and right panel dynamically updating on variant click to show all purchasing members, timestamps, payment labels, and quick actions (💬, 👤, $).

#### Scenario: Admin Selecting Size Variant for Allocation
- **WHEN** admin clicks variant "3-4y" in the left panel
- **THEN** right panel renders all members who purchased "3-4y" sorted by `preorder_submitted_at`

### Requirement: Multi-Tab Procurement and Order on Behalf UI
The product management page SHALL feature 4 status tabs (Unordered, Undelivered, Unshipped, In-Progress) and include an "Order on Behalf" modal allowing admins to manually add items for social media customers.

#### Scenario: Admin Placing Order on Behalf
- **WHEN** admin opens the Order on Behalf modal, selects member, adds SKU items, and submits
- **THEN** system creates the order and displays a confirmation with notification dispatch options

### Requirement: Member CRM and Behavior Audit Timeline
The member CRM page SHALL allow searching by name or Member ID (`2604004`), editing administrative behavior notes (e.g. "愛遲繳"), and visualizing a chronological event timeline (late payments, refunds, returned parcels).

#### Scenario: Admin Viewing Customer Timeline
- **WHEN** admin opens a member CRM card
- **THEN** system displays the chronological log of all historical events and overdue counts
