## Purpose

Provides configurable multilingual language switching (Traditional Chinese zh-TW and English en-US) with persistent user preference storage and dynamic reactive UI translations across the entire platform.

## ADDED Requirements

### Requirement: Language Toggle and Persistent State
The system SHALL provide a visible language toggle switcher in the global header and admin sidebar allowing users to switch between Traditional Chinese (`zh-TW`) and English (`en-US`). The selected language MUST be saved to `localStorage` and automatically restored upon subsequent visits.

#### Scenario: User switches language to English
- **WHEN** user clicks the language toggle and selects "English"
- **THEN** all UI labels, navigation titles, button text, and system notices immediately re-render in English without page reload
- **THEN** the preference is saved to `localStorage` as `language: en`

#### Scenario: User switches language back to Traditional Chinese
- **WHEN** user clicks the language toggle and selects "繁體中文"
- **THEN** all UI labels, navigation titles, button text, and system notices immediately re-render in Traditional Chinese
- **THEN** the preference is saved to `localStorage` as `language: zh`

### Requirement: Dynamic Translation of Storefront and Member Dashboard
The system SHALL translate all public storefront and member dashboard components, including Announcement Bar, navigation items, product listings, size chart modals, cart drawer, checkout forms, 7-11 instructions, and order milestone tracking cards.

#### Scenario: English user views checkout page
- **WHEN** user navigates to `/checkout` while English is active
- **THEN** shipping method options display "7-11 Store Pickup (NT$60)" and "Post Office Delivery (NT$80)"
- **THEN** discount lines display "Store Credits Applied", "Bulk Discount", and "Total Payable"

### Requirement: Dynamic Translation of Admin Panel Views
The system SHALL translate all admin panel headers, navigation tabs, milestone editors, split-screen allocation columns, CRM remarks, broadcast template variables, and financial ledger tables.

#### Scenario: Admin views Allocation page in English
- **WHEN** admin visits `/admin/allocation` in English mode
- **THEN** headers display "Order Allocation Management" with left column "Product Demand Summary" and right column "Matched Buyer Queue"
