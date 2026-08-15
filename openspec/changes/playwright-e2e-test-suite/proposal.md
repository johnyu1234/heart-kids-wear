## Why

To guarantee end-to-end platform stability, prevent regressions, and verify critical pre-order business flows across both Member Storefront and Admin Management portals, a comprehensive Playwright browser test suite with automated database rollback is introduced. This enables visible and headless execution of full user journeys without leaving persistent test artifacts in the database.

## What Changes

- **Automated SQLite Database Rollback Mechanism**: Test fixtures automatically snapshot the database (`heart_kids_wear.db.e2e_backup` / `heart_kids_wear.db.e2e_customer_backup`) and revert all changes on suite exit or failure.
- **Member Authentication & Form Validation Suite**: E2E testing for password mismatch, duplicate email prevention, invalid credentials handling, and registration welcome gift card (60 points) verification.
- **Terms & Rules Agreement Validation**: Strict client-side validation popup and visual highlight alerts when completing registration or pre-orders without checking the agreed terms box.
- **Admin Authentication & Route Security Guards**: Playwright testing for role-based route blocking of unauthenticated guests and regular non-admin members.
- **Admin Operations Suite**: Full-stack coverage of SKU variant creation, product archiving, member CRM tag editing, points card issuance, customer proxy orders, shipping status filters, volumetric freight fee calculations, multi-channel template broadcasting, and financial revenue KPIs.
- **Customer Pre-Order Shopping Suite**: Full user journey testing for group buy browsing, size/SKU selection, wishlist management, cart rules, checkout discount deductions, pre-order placement, 5-digit bank transfer reporting, and real-time customer service messaging.
- **Dual Execution Modes**: Support for standard headless CI execution and `--headed` visible browser mode with visual delays for live demonstration.

## Capabilities

### New Capabilities
- `testing/playwright-e2e`: Comprehensive Playwright browser automation suite covering authentication, admin operations, customer pre-orders, and database auto-rollback.

### Modified Capabilities
- None

## Impact

- **Affected Code**: `frontend/tests/auth_test.mjs`, `frontend/tests/admin_auth_test.mjs`, `frontend/tests/admin_operations_test.mjs`, `frontend/tests/customer_operations_test.mjs`, `frontend/package.json`, `package.json`, `frontend/src/pages/public/RegisterPage.jsx`, `frontend/src/pages/public/CheckoutPage.jsx`, `frontend/src/context/CartContext.jsx`.
- **Dependencies**: `playwright` (Chromium browser engine).
- **APIs & Data**: SQLite auto-snapshotting and safe rollback on test lifecycle completion.
