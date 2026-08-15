## Purpose

Specifies the member account portal including Orders History (sequential pre-order layout with status pills & tracking links), Message Center, and Account Profile Settings.

## ADDED Requirements

### Requirement: Split-Layout Member Account Navigation
The member dashboard SHALL use a split-column interface: left-hand navigation menu (Orders history, Buy again, Messages, My Account, Log out) and right-hand content display.

#### Scenario: Navigating Member Sections
- **WHEN** logged-in member selects "Messages" from the left menu
- **THEN** right pane renders the customer message exchange history and response timeline

### Requirement: Pre-Order and Order History Layout
The Orders History page SHALL present items sequentially: Product Photo > Product Name > Style > Specification > Quantity > Pre-order Status (In Progress, Registered, Out of Stock), showing customer-visible remarks, order number, and clickable 7-11 tracking code links.

#### Scenario: Member Viewing Pre-order Item Remarks
- **WHEN** member views an order containing an item in "In Progress" status
- **THEN** system displays the customer-facing remark (e.g. "目前缺貨待補貨") and remaining account store credits

### Requirement: My Account Profile Management
The account page SHALL separate basic profile (immutable legal name, DOB, phone, contact address) from editable settings (managing multiple 7-11 & Post Office delivery addresses, email, password, and points balance).

#### Scenario: Member Setting New Default Shipping Address
- **WHEN** member adds a new 7-11 store address and toggles "Set as Primary"
- **THEN** system saves the address and highlights it as the default for upcoming checkouts
