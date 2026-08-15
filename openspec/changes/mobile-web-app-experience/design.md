## Context

The current desktop storefront and admin layouts use fixed container max-widths and a fixed 260px desktop sidebar. On mobile screens (<768px), navigation header links get cramped, the admin sidebar takes significant screen estate, and standard mobile browser navigation chrome covers bottom content without safe-area offsets.

## Goals / Non-Goals

**Goals:**
- Provide full PWA web app manifest (manifest.webmanifest), Apple touch icons, theme colors (#E05D5D), and standalone display mode.
- Implement a fixed, responsive mobile bottom navigation bar (MobileNavBar.jsx) that renders on < 768px with Home, Shop, Cart (with live badge), Orders, and Chat.
- Add safe-area insets (env(safe-area-inset-bottom)) and responsive padding across all mobile pages.
- Add a collapsible mobile navigation drawer in AdminSidebar.jsx for admin operations on mobile viewports.

**Non-Goals:**
- Building native iOS/Android binary apps (Swift/Kotlin) — this change provides high-performance Mobile Web App / PWA.
- Offline database synchronization (e-commerce inventory and checkout require live connectivity).

## Decisions

1. **PWA Standalone Manifest vs Native App**:
   - *Decision*: Provide standard Web App Manifest and Apple Mobile Web App meta tags with SVG/PNG icons and display: standalone.
   - *Rationale*: Allows users to \"Add to Home Screen\" on iPhone and Android directly from the browser without app store friction.

2. **Mobile Bottom Navigation Component (MobileNavBar.jsx)**:
   - *Decision*: Mount MobileNavBar in rontend/src/App.jsx outside the admin route.
   - *Rationale*: Replicates native e-commerce app ergonomics (Shopee, Pinkoi, Zara) with thumbs-first bottom navigation.

3. **Admin Drawer Navigation**:
   - *Decision*: Use CSS media queries + React open/close state to transform the 260px sidebar into a floating mobile header + slide-over drawer on < 768px.
   - *Rationale*: Enables store administrators to comfortably manage orders and dispatch parcels from mobile phones.

## Risks / Trade-offs

- [Risk] Bottom nav covering page footer/buttons → *Mitigation*: Add padding-bottom: calc(70px + env(safe-area-inset-bottom)) on mobile layout container.
- [Risk] Admin tables overflowing on small screens → *Mitigation*: Enable overflow-x: auto with smooth scrolling and responsive card wrappers.
