## Context

Heart Kids Wear operates a pre-order e-commerce workflow sourcing children's clothing from the UK for customers in Taiwan. The architecture must support both customer-facing storefront/account portals and high-touch administrative operations including item allocation, logistics timestamping, and multi-stage payment overdue escalations.

See `proposal.md` and `docs/database_schema.md` for full background context.

## Goals / Non-Goals

**Goals:**
- Implement a decoupled SPA frontend in React (Vite) and backend in Python (FastAPI).
- Use SQLite with SQLAlchemy ORM and Alembic migrations, designed for future zero-friction PostgreSQL portability.
- Restrict all HTTP API mutation endpoints strictly to `POST` and retrieval to `GET` (no `PUT` or `DELETE` verbs).
- Build automated scheduled tasks for overdue payment escalation and points expiration.
- Maintain dual-track remark logging (customer-visible vs admin-only).
- Support mock bank transfer logging while retaining architecture for real gateway integration via `PAYMENT_GATEWAY_ENABLED`.

**Non-Goals:**
- Real-time synchronous credit card payment processing (reserved for future activation).
- Native 7-11 e-map iframe embedding (using official external link redirect per security constraints).
- Real-time WebSocket clustering (polling-based chat and badge counts are sufficient for this traffic scale).

## Decisions

### 1. API Verb Convention: GET and POST Only
- **Decision**: All read endpoints use `GET`; all write, update, delete, and workflow operations use `POST` with descriptive action routes (e.g., `POST /api/cart/remove`, `POST /api/admin/products/archive`).
- **Rationale**: Simplifies client HTTP interaction and firewall configuration; strictly satisfies project operational requirements.
- **Alternatives Considered**: Standard REST verbs (`PUT`/`PATCH`/`DELETE`) rejected per explicit user requirement.

### 2. Relational Database Schema: SQLite with SQLAlchemy ORM
- **Decision**: 19 normalized relational tables managed via SQLAlchemy models with SQLite WAL mode (`journal_mode=WAL`) and `PRAGMA foreign_keys = ON`.
- **Key Tables**: `members`, `shipping_addresses`, `categories`, `group_campaigns`, `products`, `product_variants`, `product_images`, `orders`, `order_items`, `wishlist`, `cart_items`, `messages`, `message_templates`, `points_cards`, `member_events`, `payment_records`, `expense_ledger`, `income_ledger`, `system_config`.
- **Rationale**: File-backed database with zero operational cost and complete ACID compliance, fully documented in `docs/database_schema.md`.

### 3. Order ID and Member ID Sequential Generators
- **Decision**: 
  - `orders.order_number`: `YYMM` + 4-digit sequential integer (e.g., `26040001`).
  - `members.member_id`: `YYMM` + 3-digit sequential integer assigned on first purchase (e.g., `2604004`).
- **Rationale**: Matches legacy manual auditing conventions and supplier tracking requirements.

### 4. Automated 4-Stage Payment Escalation Pipeline
- **Decision**: A background service runs daily checking order deadlines:
  - **Stage 0 (Day 0)**: Send final payment deadline reminder.
  - **Stage 1 (Day 1)**: Switch order to `OVERDUE_GRACE` (manual transfer with last-5-digits reporting only, 3-day hard timer).
  - **Stage 2 (Day 3-4)**: Send final warning notification.
  - **Stage 3 (Day 4+)**: Transition to `ABANDONED`, release reserved inventory, increment `members.overdue_count`, and record `LATE_PAYMENT` / `ORDER_ABANDONED` events in `member_events`.

### 5. Automated Store Credit Refund on Out of Stock
- **Decision**: When an admin marks an `order_items` record with `discontinued_date` (status `OUT_OF_STOCK`), the system automatically computes `unit_price * quantity`, credits the member's `store_credits`, records a `STOCKOUT_REFUND` event, and pushes an in-app message.

### 6. Frontend Design System & Typography
- **Decision**: Custom Vanilla CSS design system with curated warm color tokens (`--primary-heart`, `--accent-soft`, `--text-main`, `--bg-card`), responsive mobile-first layouts, and Google Fonts (Outfit / Inter / Noto Sans TC).

## Risks / Trade-offs

- **[Risk] Concurrent SQLite write contention** → **Mitigation**: Enable SQLite WAL mode, keep database transactions short and scoped, and run FastAPI with single-writer or scoped session management.
- **[Risk] Uncollected 7-11 packages** → **Mitigation**: System logs `PACKAGE_RETURNED` events on member profile and prompts customer with standard NT$120 reshipment fee notices.
- **[Risk] Customer email deliverability** → **Mitigation**: Standardized SMTP / Resend integration with SPF/DKIM verification and fallback in-app message history.

## Migration Plan

1. Initialize SQLite database schema and run seed migrations for default categories, system config, and message templates.
2. Build FastAPI service modules with JWT authentication and OpenAPI schema endpoints.
3. Build React client components and wire with Axios API layer.
4. Execute full end-to-end user checkout and admin allocation verification.
