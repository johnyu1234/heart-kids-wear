## Context

The Heart Kids Wear full-stack platform comprises a FastAPI backend and a React + Vite frontend. To validate multi-step transactions (auth, variant selection, cart rules, pre-order placement, member messaging, admin ERP operations) while maintaining SQLite database integrity, an automated E2E testing framework is designed using Playwright with filesystem snapshotting.

## Goals / Non-Goals

**Goals:**
- Provide 4 automated test suites: `test:e2e` (Member Auth), `test:admin` (Admin Auth & Guards), `test:admin:ops` (Admin Operations), and `test:customer` (Customer Shopping & Pre-Order Flow).
- Implement non-destructive database backup and rollback on all state-modifying suites.
- Support both headless execution for CI/CD and visible `--headed` browser execution with configurable step timeouts for live interactive review.
- Provide explicit alert pop-ups and red border indicators on mandatory policy agreements during registration and checkout.

**Non-Goals:**
- External third-party payment gateway mock APIs (e.g. live ECPay/NewebPay sandbox calls).
- Production cloud migration scripts (focus is on local and CI execution).

## Decisions

1. **Standalone Node.js ESM Test Runner (`.mjs`)**:
   - *Decision*: Write Playwright suites directly using `playwright` npm package with modern ES modules (`.mjs`).
   - *Rationale*: Zero extra configuration, lightweight dependencies, and instant compatibility with Vite/Node v20+.
   - *Alternative Considered*: Full `@playwright/test` runner configuration file (`playwright.config.ts`), which requires TypeScript transpilation and more complex setup.

2. **Filesystem SQLite Backup and Rollback**:
   - *Decision*: Snapshot `backend/data/heart_kids_wear.db` to `.e2e_backup` in the test setup block, and restore in the `finally {}` block.
   - *Rationale*: Guaranteed zero-pollution across all database tables without needing complex transaction rollback logic across asynchronous FastAPI processes.

3. **Dual Language Locale & Modal Handling**:
   - *Decision*: Register dialog listeners (`page.on('dialog', ...)`) and match multi-attribute locators with bilingual fallback selectors.
   - *Rationale*: Guarantees test stability across both `繁體中文` and `English` application locales.

## Risks / Trade-offs

- [Concurrent SQLite access during test snapshot restore] → FastAPI server is gracefully kept alive while file copy replaces the database file atomically; WAL mode handles concurrent readers.
- [Slow browser execution in headed mode] → Defaults to headless mode (`test:customer`, `test:admin:ops`) with dedicated `:headed` script targets for manual visual inspection.
