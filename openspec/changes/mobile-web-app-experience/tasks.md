## 1. PWA Manifest & Mobile Viewport Setup

- [x] 1.1 Create `frontend/public/manifest.webmanifest` with PWA metadata, standalone display, brand theme `#E05D5D`, and app icons
- [x] 1.2 Update `frontend/index.html` with Apple Touch Icon, mobile web app capable tags, and `viewport-fit=cover`

## 2. Customer Mobile Navigation & Bottom Bar

- [x] 2.1 Create `frontend/src/components/layout/MobileNavBar.jsx` with Home, Shop, Cart (with live badge), Orders, and Chat links
- [x] 2.2 Integrate `MobileNavBar` into `frontend/src/App.jsx` and add safe-area bottom padding in `frontend/src/index.css`
- [x] 2.3 Add responsive mobile header styling in `frontend/src/components/layout/Header.jsx`

## 3. Responsive Admin Mobile Drawer

- [x] 3.1 Update `frontend/src/components/layout/AdminSidebar.jsx` with mobile drawer hamburger button and slide-over overlay for viewports < 768px
- [x] 3.2 Update `frontend/src/components/layout/AdminLayout.jsx` with mobile padding and touch-friendly controls

## 4. Verification & Testing

- [x] 4.1 Verify mobile viewport responsiveness and bottom bar navigation
- [x] 4.2 Run Playwright E2E test suites to ensure zero regressions
