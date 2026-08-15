## Purpose

Provides native-grade mobile web app installability (PWA), sticky bottom navigation bar, safe-area insets, touch optimizations, and mobile admin navigation drawer for smartphone shoppers and store operators.

## ADDED Requirements

### Requirement: Progressive Web App Manifest & Installability
The system SHALL provide a web app manifest (manifest.webmanifest) and standard mobile meta tags allowing users on iOS and Android to install Heart Kids Wear as a standalone mobile application with custom theme colors and icons.

#### Scenario: User opens web app on mobile device or adds to home screen
- **WHEN** a visitor loads the website on a mobile browser or installs the app to their home screen
- **THEN** the application launches in standalone mode with brand color #E05D5D and customized application icons
- **THEN** browser viewport adapts with iewport-fit=cover respecting device notch and safe-area insets

### Requirement: Mobile Bottom Navigation Bar
The system SHALL display a fixed bottom navigation bar on mobile viewports (< 768px) providing one-tap navigation to core customer sections with active status indicators and live cart badge counters.

#### Scenario: Customer navigates using bottom navigation bar on mobile
- **WHEN** a customer views the storefront on a viewport under 768px
- **THEN** a persistent bottom navigation bar is displayed with Home (首頁), Catalog (選購), Cart (購物車 with live item count), Orders (預購進度), and Chat (客服)
- **THEN** tapping any icon navigates instantly to the corresponding view and updates the active highlight

### Requirement: Mobile Touch-Target Accessibility & Form Ergonomics
The system SHALL ensure all interactive buttons, SKU selectors, checkboxes, and input fields adhere to mobile touch guidelines with minimum tap target heights of 44px and responsive layouts that prevent horizontal viewport overflow.

#### Scenario: Customer places order on mobile screen
- **WHEN** a customer selects product variants, agrees to terms, and submits checkout on a mobile device
- **THEN** all buttons and inputs provide comfortable touch targets without requiring pinch-to-zoom
- **THEN** the layout adapts without horizontal scrollbars or clipping

### Requirement: Mobile Admin Sidebar Drawer
The system SHALL provide a collapsible mobile navigation drawer for the Admin Panel on mobile devices so store managers can operate all 9 business modules on smartphones and tablets.

#### Scenario: Administrator accesses admin panel on mobile device
- **WHEN** an authenticated administrator opens /admin on a viewport under 768px
- **THEN** the desktop sidebar collapses into a floating/top mobile header with a drawer hamburger toggle
- **THEN** tapping the toggle smoothly opens the full 9-step admin navigation menu
