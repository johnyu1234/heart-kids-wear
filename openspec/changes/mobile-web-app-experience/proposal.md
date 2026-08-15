## Why

Over 80% of parents and boutique shoppers browse, pre-order, and track logistics updates on their smartphones (iOS Safari, Android Chrome, and Line in-app browser). Heart Kids Wear needs native-grade mobile web app support (PWA installability, bottom app navigation bar, touch-friendly tap targets, safe-area insets, and responsive admin drawers) to provide a seamless mobile shopping and operations experience.

## What Changes

- **PWA Web App Manifest & Meta Tags**: Add manifest.webmanifest, app icons, theme colors (#E05D5D), Apple mobile web app standalone configuration, and viewport safe-area insets (iewport-fit=cover).
- **Mobile Bottom Navigation Bar**: Fixed bottom touch bar on mobile screens (<768px) with one-tap access to Home (首頁), Catalog (選購), Cart (購物車 with live badge count), Orders (預購進度), and Chat (線上客服).
- **Mobile Header & Touch Adaptations**: Streamlined mobile header with brand logo, search bar, language toggle, and responsive touch padding (>= 44px).
- **Responsive Admin Mobile Drawer**: Add collapsible mobile navigation drawer toggle for administrators accessing /admin on phones/tablets.
- **Mobile Checkout & Stepper Viewport Optimization**: Ensure order summary, checkout forms, and live milestone progress steps fit comfortably on narrow screens without horizontal overflow.

## Capabilities

### New Capabilities
- mobile/web-app: Mobile web app installability (PWA), sticky bottom navigation bar, safe-area insets, touch optimizations, and mobile admin navigation drawer.

### Modified Capabilities
<!-- None -->

## Impact

- **Frontend Assets**: rontend/index.html, rontend/public/manifest.webmanifest, rontend/src/components/layout/MobileNavBar.jsx, rontend/src/components/layout/Header.jsx, rontend/src/components/layout/AdminSidebar.jsx, rontend/src/index.css.
- **APIs**: No backend schema or REST API changes required.
- **Dependencies**: Uses existing React, Vite, and Lucide React packages.
