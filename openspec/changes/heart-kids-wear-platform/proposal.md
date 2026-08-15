## Why

Heart Kids Wear (心童裝) operates a UK-sourced children's clothing pre-order business in Taiwan. Sourcing, allocation, shipping, and payment reconciliation across Facebook, Instagram, and LINE currently involve labor-intensive manual steps, leading to communication overhead, order errors, and delayed tracking. 

Building a dedicated full-stack pre-order e-commerce web platform (React frontend + Python FastAPI backend + SQLite database) unifies customer ordering, automated marketing survey collection, 7-11 store pickup/post office shipping validation, payment logging, order allocation, customer messaging, and monthly financial reporting into a single system.

## What Changes

- **Database Layer (DB)**:
  - 19 normalized relational tables in SQLite (WAL mode) via SQLAlchemy ORM with foreign key enforcement.
  - Initial database migrations and seed fixtures for categories, message templates, system config flags, and default admin.
- **Backend API & Business Logic Layer (BE)**:
  - Strict GET/POST-only REST API endpoints using FastAPI and auto-generated OpenAPI documentation.
  - JWT authentication with case-insensitive email matching.
  - Order sequential numbering (`YYMM0001`) and member numbering (`YYMM004`).
  - Checkout fee calculations: 7-11 (NT$60) vs Post Office (NT$80 with >15 items lock) and NT$4,000 threshold discounts.
  - Store credit 100% auto-refund trigger on item discontinuation.
  - Automated 4-stage overdue payment escalation pipeline and points expiry notifications.
  - Chat auto-reply and dynamic template broadcast engine (`{{name}}`, `{{tracking}}`).
  - Dual-currency expense ledger with freight formulas and revenue/profit/AOV reporting.
- **Frontend User & Admin Interface Layer (FE)**:
  - Custom Vanilla CSS design system with warm color palette, micro-animations, and `NT$X,XXX` currency formatting.
  - Public storefront: Top announcement bar, 2-tier filtered product catalog, product detail with size charts, full registration with 7-11 info and marketing survey, pre-order confirmation modal, and checkout with travel schedule notes.
  - Member account portal: Split-column layout, pre-order tracking columns with status pills and tracking links, address book, and message center.
  - Floating "Chat with us!" widget with live message exchange and automated welcome reply.
  - Comprehensive 10-page admin management panel matching specification layout order.

## Capabilities

### New Capabilities

#### Database Layer (DB)
- `db/schema-models`: Complete 19-table relational database schema covering members, products, variants, orders, messages, credits, payments, and financial ledgers.
- `db/seed-and-config`: System configuration flags (`PAYMENT_GATEWAY_ENABLED`, fees, thresholds), pre-seeded 2-tier categories, default message templates, and initial administrator account.

#### Backend Layer (BE)
- `be/auth-member-api`: Authentication (register, login, password reset), member profile management, and member event timeline audit logging.
- `be/product-catalog-api`: Product catalog queries, 2-tier category filtering, price sorting, group campaign retrieval, and independent variant SKU generation.
- `be/cart-checkout-api`: Shopping cart operations, pre-order validation, shipping fee calculation with 15-item lock, NT$4,000 discount rules, and order submission.
- `be/order-logistics-api`: Order allocation queries, logistics timestamp updates with flexible batch text support (`2026/06/07(1)`), and dual-track remark logging.
- `be/points-credits-api`: Store credit auto-refund execution on stockout, points card management, and automated background schedulers for expiration and payment escalation.
- `be/messaging-notifications-api`: Live chat messaging with canned welcome auto-reply, unread badge counters, and bulk template broadcasting with dynamic variable replacement.
- `be/admin-finance-api`: Payment log queries with multi-dimensional filtering, monthly expense ledger with freight formulas, and revenue/profit reporting with AOV calculation.

#### Frontend Layer (FE)
- `fe/design-system-layout`: Design system tokens, global navigation header, announcement banner, footer with social links, floating chat widget, and NT$ currency formatter.
- `fe/public-storefront`: Public pages including Home, 2-tier Product List, Product Detail with size charts, Login, Registration with 7-11 lookup & survey, Cart modal, and Checkout.
- `fe/member-dashboard`: Member portal with Orders History (pre-order status pills, customer remarks, tracking links), Account Settings, Message Center, and Wishlist.
- `fe/admin-panel`: Admin interface covering all 10 management views (Dashboard, Product Import, Categories, Procurement Tabs, All Orders, Split-Screen Allocation, Logistics Checkboxes, Member CRM, Messaging, Finance & Reports).

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- **Frontend**: Full React (Vite) client application with public storefront, member dashboard, and admin panel.
- **Backend**: FastAPI REST API implementing all business logic with GET and POST endpoints.
- **Database**: SQLite database initialized with 19 tables and seed data.
