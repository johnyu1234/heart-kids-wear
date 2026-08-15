# Proposal: Database Schema & Relational Models (DB)

## Why
Heart Kids Wear requires a relational database schema capable of managing pre-orders, complex logistics states (unordered, undelivered, unshipped, in-progress), dual-track remarks (customer vs admin), multi-address preferences, ad-hoc point cards, store credit refunds, and monthly dual-currency expense ledgers.

## What Changes
- Implement 19 relational tables in SQLite.
- Configure Write-Ahead Logging (`WAL`) mode and foreign key enforcement.
- Establish indexes on `email`, `member_id`, `sku`, `order_number`, `created_at`, `paid_at`.

## Impact
- Core persistence layer for all backend services and frontend portals.
