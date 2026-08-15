## Purpose

Specifies public storefront pages including Home, 2-Tier Product Catalog, Product Detail with size charts, Login, Registration with 7-11 info & marketing survey, Cart confirmation modal, and Checkout.

## ADDED Requirements

### Requirement: Product Detail Page with Discount Reminder and Size Charts
The product detail page SHALL display image galleries, an expandable brand size chart, SKU variant selectors, and a permanent promotional banner adjacent to "Add to Cart" stating "滿4,000折60元優惠".

#### Scenario: Customer Selecting Variant on Product Page
- **WHEN** customer selects size "2-3y" and color "Blue"
- **THEN** system updates the displayed SKU and stock status and enables the "Add to Cart" button

### Requirement: Full Registration Page with 7-11 Store Lookup and Survey
The registration page SHALL provide inputs for personal profile, 7-11 store name, store code, recipient ID name, recipient phone, marketing survey (FB/IG/LINE handles), shopping rules checkbox, and an external lookup button linking to `https://emap.pcsc.com.tw/`.

#### Scenario: Submitting Incomplete Registration
- **WHEN** user clicks register without agreeing to shopping rules
- **THEN** system prevents submission and triggers a popup modal: "請勾選我同意且會配合心童裝的購物規則"

### Requirement: Cart Pre-Order Confirmation Modal
The cart page SHALL enforce a confirmation popup before checkout submission containing the mandatory checkbox: "我已確認款式、規格和數量，瞭解送出後無法更改或取消。".

#### Scenario: Submitting Cart Pre-order
- **WHEN** customer checks the pre-order verification checkbox and clicks continue
- **THEN** application transitions to the checkout screen

### Requirement: Checkout Page with 15-Item Lock and Travel Schedule Notes
The checkout page SHALL enforce Post Office shipping (NT$80) if item count > 15, auto-deduct NT$60 if subtotal >= NT$4,000, disable the Pay button until Terms & Conditions are agreed, and display a post-payment success modal collecting customer travel schedule dates.

#### Scenario: Completing Checkout
- **WHEN** customer agrees to Terms & Conditions and clicks Pay Now
- **THEN** system records the order and opens the post-payment modal with travel date instructions
