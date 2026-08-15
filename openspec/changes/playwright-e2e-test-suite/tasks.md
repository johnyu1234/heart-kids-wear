## 1. Test Automation Setup & Auto-Rollback Engine

- [x] 1.1 Configure Playwright browser engine and npm test runner scripts in `package.json` and `frontend/package.json`
- [x] 1.2 Implement automatic SQLite database backup (`heart_kids_wear.db.e2e_backup` / `heart_kids_wear.db.e2e_customer_backup`) and safe restoration in test `finally` handlers
- [x] 1.3 Add CLI flag parsing for `--headed` visible browser mode and headless CI execution

## 2. Member Authentication & Form Validation Test Suite

- [x] 2.1 Implement password mismatch rejection test in `frontend/tests/auth_test.mjs`
- [x] 2.2 Implement registration flow test with 60-point welcome gift card bonus verification
- [x] 2.3 Implement duplicate email registration rejection test
- [x] 2.4 Implement invalid credentials and case-insensitive login validation tests
- [x] 2.5 Add registration terms agreement popup alert dialog and red border highlight in `frontend/src/pages/public/RegisterPage.jsx`

## 3. Admin Authentication & Role-Based Guard Test Suite

- [x] 3.1 Implement unauthenticated visitor route guard blocking test in `frontend/tests/admin_auth_test.mjs`
- [x] 3.2 Implement non-admin member route guard redirection test
- [x] 3.3 Implement admin login, JWT storage, top bar badge, and dashboard sidebar navigation tests
- [x] 3.4 Implement admin sub-page routing and logout clearing verification

## 4. Admin Operations & ERP Workflow Test Suite

- [x] 4.1 Implement product creation with auto-generated SKU variants and product archiving in `frontend/tests/admin_operations_test.mjs`
- [x] 4.2 Implement member CRM search, tag updates, and NT$100 points card issuance
- [x] 4.3 Implement customer proxy pre-order placement on behalf of buyer
- [x] 4.4 Implement 4-tab fulfillment status filtering and tracking updates
- [x] 4.5 Implement volumetric freight calculation (L×W×H÷6000) and expense ledger recording
- [x] 4.6 Implement multi-channel broadcast notification queue dispatch
- [x] 4.7 Implement revenue, profit, and AOV analytics dashboard inspection

## 5. Customer Pre-Order Shopping & Member Center Test Suite

- [x] 5.1 Implement storefront product browsing and size/SKU selection in `frontend/tests/customer_operations_test.mjs`
- [x] 5.2 Implement wishlist page exploration
- [x] 5.3 Implement pre-order cart item addition, bulk rules, and subtotal verification
- [x] 5.4 Implement checkout with 7-11 shipping, points card deduction, and pre-order submission in `frontend/src/pages/public/CheckoutPage.jsx`
- [x] 5.5 Implement member order milestones inspection and 5-digit bank transfer (`末 5 碼`) reporting in `frontend/src/pages/member/OrderHistoryPage.jsx`
- [x] 5.6 Implement customer service chat inquiry dispatching in `frontend/src/pages/member/MessagesPage.jsx`
- [x] 5.7 Implement member account profile and points card balance verification in `frontend/src/pages/member/ProfilePage.jsx`

## 6. End-to-End Verification & Documentation

- [x] 6.1 Validate all 4 test suites passing (`test:e2e`, `test:admin`, `test:admin:ops`, `test:customer`) with zero database leakage
- [x] 6.2 Validate OpenSpec change status and specs synchronization
