## Purpose

Manages initial database seeding, system configuration flags, default categories, and pre-seeded message templates.

## ADDED Requirements

### Requirement: Default Category Tree Seeding
The initialization routine SHALL populate Tier-1 categories (Boys, Girls, Baby Boys, Baby Girls, Others) and standard age group Tier-2 child categories into the `categories` table.

#### Scenario: Database Initialization Seeds Categories
- **WHEN** database initialization script executes on an empty database
- **THEN** five Tier-1 category records and corresponding child age-bracket records are created

### Requirement: System Configuration Flags Management
The `system_config` table SHALL store operational key-value settings including `PAYMENT_GATEWAY_ENABLED` (default `false`), `BULK_DISCOUNT_THRESHOLD` (`4000`), `BULK_DISCOUNT_AMOUNT` (`60`), `SHIPPING_FEE_711` (`60`), `SHIPPING_FEE_POST` (`80`), and `MAX_ITEMS_711` (`15`).

#### Scenario: Querying Mock Payment Configuration
- **WHEN** backend checks `PAYMENT_GATEWAY_ENABLED` from `system_config`
- **THEN** system returns `false` by default to operate in mock payment logging mode

### Requirement: Standard Message Template Seeding
The database SHALL pre-seed official communication templates including 7-11 Shipping Notification, 7-11 Pickup Reminder, Payment Deadline Reminder, Grace Period Notice, and Final Overdue Warning.

#### Scenario: Retrieving Pre-Seeded Shipping Template
- **WHEN** admin opens the messaging template dropdown
- **THEN** system provides the pre-seeded 7-11 shipping notification containing variable placeholders `{{name}}` and `{{tracking}}`
