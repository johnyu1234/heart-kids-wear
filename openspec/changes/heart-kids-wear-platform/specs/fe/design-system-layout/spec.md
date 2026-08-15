## Purpose

Defines the frontend design system, color tokens, typography, global header with action icons, announcement banner, footer, floating chat widget, and NT$ currency formatting.

## ADDED Requirements

### Requirement: Design System Tokens and Currency Formatting
The frontend SHALL define a Vanilla CSS design system featuring warm children's boutique color tokens, modern responsive typography (Outfit / Inter / Noto Sans TC), micro-animations, and format all currency amounts throughout the app as `NT$X,XXX`.

#### Scenario: Displaying Formatted Currency
- **WHEN** any component renders a price of 1000
- **THEN** it renders as `NT$1,000`

### Requirement: Top Announcement Banner
The top of the application SHALL display a permanent announcement banner containing the text: "註冊首次送60點=7-11免運費。快來註冊看更多商品".

#### Scenario: User Viewing Homepage
- **WHEN** user visits any public page
- **THEN** top announcement banner is displayed above the navigation bar

### Requirement: Global Navigation Header with Action Icons
The header SHALL display the Heart Kids Wear logo on the left (linking to home) and on the top right: Shopping Cart icon (with preview dropdown & badge), Wishlist heart icon, Profile icon (with unread red badge), and Search icon.

#### Scenario: User Clicking Logo from Subpage
- **WHEN** user clicks the logo on `/cart` or `/products/1`
- **THEN** application redirects back to `/`

### Requirement: Floating Chat Widget with Auto-Reply Dialogue
The application SHALL render a floating circular "Chat with us!" button at the bottom-right corner across all pages that opens into an interactive dialogue sidebar.

#### Scenario: Expanding Live Chat
- **WHEN** user clicks the circular chat button
- **THEN** chat window slides open on the right side of the screen displaying conversation history
