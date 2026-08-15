# Proposal: Database Seeding & System Configuration (DB)

## Why
The platform requires pre-configured foundational data upon startup, including the 2-tier product category taxonomy, communication templates with dynamic variables, system flags (e.g. `PAYMENT_GATEWAY_ENABLED`), and an initial administrator account.

## What Changes
- Seed Tier-1 categories (Boys, Girls, Baby Boys, Baby Girls, Others) and child Tier-2 age brackets.
- Seed system flags: shipping fees (7-11 NT$60, Post NT$80), discount threshold (NT$4,000), 15-item limit, mock payment flag (`false`).
- Seed standard message templates (7-11 shipping notification, pickup reminders, overdue warnings).
- Seed demo admin credentials and initial sample products.

## Impact
- Enables instant platform boot and manual verification without manual data entry.
