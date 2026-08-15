# Tasks: Shopping Cart & Pre-Order Checkout API (BE)

- [x] 5.1 Implement cart endpoints `GET /api/cart`, `POST /api/cart/add`, `POST /api/cart/update`, `POST /api/cart/remove` in `backend/app/api/cart.py`
- [x] 5.2 Implement fee calculation utility in `backend/app/services/checkout_service.py` (7-11 NT$60 vs Post Office NT$80 with >15 items lock, NT$4,000 discount, store credit & points deductions)
- [x] 5.3 Implement `POST /api/checkout/calculate` in `backend/app/api/checkout.py`
- [x] 5.4 Implement order number generator (`YYMM0001`) in `backend/app/utils/id_generators.py`
- [x] 5.5 Implement `POST /api/checkout/submit` in `backend/app/api/checkout.py` (records `preorder_submitted_at`, applies credits, saves travel notes, logs payments, and clears cart)
- [x] 5.6 Write automated tests for discount rules, shipping locks, and order numbering
