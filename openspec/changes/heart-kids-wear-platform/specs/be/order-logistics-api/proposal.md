# Proposal: Order Allocation & Logistics Milestones API (BE)

## Why
Admins require a split-screen interface to allocate purchased stock to members prioritized by submission timestamp (`preorder_submitted_at`), track 4 fulfillment stages, record open-text batch dates (`2026/06/07(1)`), manage color box tags and defects, and maintain dual-track remarks (customer vs admin).

## What Changes
- `GET /api/orders` and `GET /api/orders/{order_number}` for customer pre-order tracking.
- `GET /api/admin/orders` filtered across 4 fulfillment tabs and global multi-dimensional search.
- `GET /api/admin/orders/allocation/{product_id}` for split-screen allocation.
- `POST /api/admin/orders/items/update-logistics` for custom date text, defects, box tags, and dual remarks.
- `POST /api/admin/orders/create-for-customer` for placing proxy orders.

## Impact
- Powers core warehouse fulfillment, procurement tracking, and customer order visibility.
