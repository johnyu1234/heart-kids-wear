## Purpose

Handles shopping cart mutations, live fee/discount calculations, 15-item shipping fee locking, order number generation (`YYMM0001`), and pre-order submission.

## ADDED Requirements

### Requirement: Shopping Cart API (Strictly POST, No PUT/DELETE)
The backend SHALL expose `GET /api/cart`, `POST /api/cart/add`, `POST /api/cart/update`, and `POST /api/cart/remove` for authenticated members.

#### Scenario: Adding Item to Cart
- **WHEN** member posts `{ "variant_id": 10, "quantity": 2 }` to `POST /api/cart/add`
- **THEN** backend adds or updates the cart item quantity and returns the updated cart contents

### Requirement: Live Checkout Calculation API
The backend SHALL expose `POST /api/checkout/calculate` calculating item subtotal, shipping fee based on method and quantity restrictions (>15 items locks to Post Office NT$80), NT$4,000 threshold discount (-NT$60), available store credit deduction, and points card deduction.

#### Scenario: Order Items Exceeding 15 Items
- **WHEN** client posts 16 items with 7-11 shipping request to `POST /api/checkout/calculate`
- **THEN** backend overrides shipping type to `POST_OFFICE`, sets `shipping_fee` to 80.00, and includes restriction notice

### Requirement: Order Submission API with Sequential Numbering
The backend SHALL expose `POST /api/checkout/submit` generating sequential order number formatted as `YYMM` + 4 digits (e.g. `26040001`), recording pre-order items with submission timestamps, applying store credits, clearing cart items, and logging payment records.

#### Scenario: Pre-order Submission
- **WHEN** member submits checkout payload with terms acceptance and travel schedule notes to `POST /api/checkout/submit`
- **THEN** backend generates order number `26040001`, records all `order_items` with `preorder_submitted_at = NOW()`, clears cart items, and returns order summary with payment transfer instructions
