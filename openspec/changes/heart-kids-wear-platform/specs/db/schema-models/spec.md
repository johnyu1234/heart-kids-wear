## Purpose

Defines the relational database schema, tables, constraints, data types, and indexing strategy for the SQLite database.

## ADDED Requirements

### Requirement: Complete Relational Table Definitions
The database SHALL define 19 relational tables (`members`, `shipping_addresses`, `categories`, `group_campaigns`, `products`, `product_variants`, `product_images`, `orders`, `order_items`, `wishlist`, `cart_items`, `messages`, `message_templates`, `points_cards`, `member_events`, `payment_records`, `expense_ledger`, `income_ledger`, `system_config`) with appropriate foreign keys and primary keys.

#### Scenario: Enforcing Foreign Key Cascades and Integrity
- **WHEN** the database connection is initialized
- **THEN** SQLite executes `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;` to guarantee transactional integrity and concurrent read throughput

### Requirement: Member Profile Schema and Constraint Rules
The `members` table SHALL store unique lowercase email addresses, immutable real names, contact details, marketing channels (FB/IG/LINE handles), store credit balances, purchase counts, overdue counts, internal administrative behavior notes, and blacklist indicators.

#### Scenario: Unique Email and Member ID
- **WHEN** inserting a new member record
- **THEN** the database enforces uniqueness on `email` and `member_id`

### Requirement: Product SKU and Variant Hierarchy
The `product_variants` table SHALL enforce a unique constraint on `sku` across all variants, ensuring independent SKU tracking per size and color.

#### Scenario: Variant SKU Uniqueness
- **WHEN** two distinct variants are inserted
- **THEN** each variant is assigned a distinct `sku` string linked via `product_id` foreign key to `products`

### Requirement: Dual-Track Remarks and Logistics Milestones in Order Items
The `order_items` table SHALL include separate columns for `customer_remarks` (visible to buyer) and `admin_remarks` (restricted to admin), along with open-text ordered/arrival date fields and precision submission timestamps (`preorder_submitted_at`).

#### Scenario: Storing Flexible Date Text and Timestamps
- **WHEN** an order item is created or updated with batch text `2026/06/07(1)`
- **THEN** the database stores the custom string in `ordered_date_text` alongside the timestamp `preorder_submitted_at`
