# Playwright E2E Test Suite Specification

## Purpose

Provides comprehensive end-to-end browser automation suites for Heart Kids Wear to continuously validate authentication, product exploration, checkout logic, and administrative operations with automated zero-pollution database rollbacks.

## Requirements

### Requirement: Database Snapshot & Zero-Pollution Rollback
The test automation framework SHALL automatically create a clean database snapshot prior to running state-modifying operations and revert the database state upon test completion or failure.

#### Scenario: Successful test teardown and database restore
- **WHEN** the test suite initiates
- **THEN** an isolated backup copy of `heart_kids_wear.db` is generated
- **WHEN** tests complete all write mutations and assertions
- **THEN** the original database is restored and the backup file is removed cleanly

### Requirement: Customer Registration Terms Validation
The system SHALL prevent customer registration and display an explicit alert dialog and visual highlight if the customer submits without agreeing to pre-order shopping rules.

#### Scenario: Registration attempted with unchecked rules box
- **WHEN** a visitor submits the registration form with `agree_terms` unchecked
- **THEN** the browser displays a localized alert dialog requesting agreement
- **THEN** the shopping rules section highlights with a red outline and warning marker
- **THEN** no registration API call is dispatched

### Requirement: Customer Pre-Order Checkout Validation
The system SHALL support customer pre-order completion including SKU size selection, convenience store delivery, points card deduction, and vacation remark entry.

#### Scenario: Complete customer pre-order journey
- **WHEN** an authenticated customer adds a sized product variant to cart and proceeds to checkout
- **THEN** the order calculation reflects valid shipping fees and points card discounts
- **WHEN** the customer confirms agreement and submits the order
- **THEN** a unique sequential order number is generated and cart items are cleared

### Requirement: Bank Transfer Payment Notification
The member portal SHALL allow customers to submit their ATM account's last 5 digits for order payment verification.

#### Scenario: Customer submits last 5 digits
- **WHEN** the customer opens their order milestones in the member center and clicks report payment
- **THEN** an input dialog prompts for the 5-digit bank account number
- **WHEN** submitted, the payment verification state is recorded for admin audit

### Requirement: Admin Operations Full-Stack Verification
The admin test suite SHALL verify product SKU creation, archive toggles, member CRM updates, proxy order generation, freight ledger formulas, and broadcast dispatching.

#### Scenario: Admin creates new product with auto-generated SKUs
- **WHEN** an admin fills out the multi-size product creation form
- **THEN** independent SKU codes are automatically assigned to all size variants
- **THEN** the product is cataloged and can be archived or edited dynamically
