## Purpose

Provides backend order allocation queries, 4-stage fulfillment stage filtering, flexible logistics date tracking, dual-track notes management, and proxy order placement.

## ADDED Requirements

### Requirement: Split-Screen Order Allocation API
The backend SHALL expose `GET /api/admin/orders/allocation/{product_id}` returning all variants with unfulfilled vs fulfilled quantities, and for each variant the list of buyers ordered by `preorder_submitted_at`.

#### Scenario: Admin Querying Allocation for Product
- **WHEN** admin requests `GET /api/admin/orders/allocation/5`
- **THEN** backend returns product allocation data grouping orders by variant with buyer identity, purchase timestamp, payment status, and remarks

### Requirement: Admin Order Logistics Update API (Strictly POST)
The backend SHALL expose `POST /api/admin/orders/items/update-logistics` accepting custom string dates for ordered/arrival dates (e.g. `2026/06/07(1)`), defect information, repurchase dates, box color tags, and dual-track remarks.

#### Scenario: Admin Logging Ordered Batch and Dual Remarks
- **WHEN** admin posts `{ "item_id": 12, "ordered_date_text": "2026/06/07(1)", "customer_remarks": "採購中", "admin_remarks": "官網第一單" }` to `POST /api/admin/orders/items/update-logistics`
- **THEN** backend updates the item record and returns the updated logistics milestone state

### Requirement: Order Placement on Behalf of Customer API
The backend SHALL expose `POST /api/admin/orders/create-for-customer` allowing administrators to create orders for social media commenters and send them a checkout notification.

#### Scenario: Admin Creating Proxy Order
- **WHEN** admin posts member ID and item details to `POST /api/admin/orders/create-for-customer`
- **THEN** backend creates the order record, generates order number, and dispatches a payment notification message to the customer
