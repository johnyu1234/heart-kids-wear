# Proposal: Shopping Cart & Pre-Order Checkout API (BE)

## Why
Customers need a shopping cart and pre-order checkout flow that enforces business rules: restricting orders over 15 items to Post Office delivery (NT$80), applying a NT$60 discount on subtotal >= NT$4,000, deducting available store credits, generating standardized order numbers (`YYMM0001`), capturing travel schedule notes, and returning bank transfer payment instructions.

## What Changes
- Cart mutations (`GET /api/cart`, `POST /api/cart/add`, `POST /api/cart/update`, `POST /api/cart/remove`).
- `POST /api/checkout/calculate` for live item fee, shipping, discount, and credit calculations.
- `POST /api/checkout/submit` for order creation, timestamp logging, and cart clearance.
- Sequential `YYMM0001` order number generator.

## Impact
- Core order placement and financial calculation engine.
