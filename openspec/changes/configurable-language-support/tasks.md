## 1. i18n Translation Dictionary & Context Setup

- [x] 1.1 Create `frontend/src/i18n/translations.js` with comprehensive Chinese (`zh`) and English (`en`) translation keys
- [x] 1.2 Implement `I18nContext.jsx` and `useTranslation()` hook with `localStorage` language persistence (`zh` / `en`)
- [x] 1.3 Wrap React application root in `frontend/src/main.jsx` with `I18nProvider`

## 2. Navigation & Layout Language Switchers

- [x] 2.1 Add language switcher toggle dropdown in `frontend/src/components/layout/Header.jsx`
- [x] 2.2 Add language switcher in `frontend/src/components/layout/AdminSidebar.jsx`
- [x] 2.3 Update `AnnouncementBar.jsx`, `CartDropdown.jsx`, and `Footer.jsx` with dynamic translation keys

## 3. Storefront & Member Dashboard Multilingual Support

- [x] 3.1 Translate `HomePage.jsx` hero banner, feature badges, and product cards
- [x] 3.2 Translate `ProductListPage.jsx` and `ProductDetailPage.jsx` (2-tier filters, sorting, size chart modal)
- [x] 3.3 Translate `LoginPage.jsx`, `RegisterPage.jsx`, and `ForgotPasswordPage.jsx`
- [x] 3.4 Translate `CartPage.jsx` and `CheckoutPage.jsx` (shipping methods, 15-item warning, discount rules, travel notes)
- [x] 3.5 Translate Member Dashboard views (`OrderHistoryPage.jsx`, `ProfilePage.jsx`, `WishlistPage.jsx`, `MessagesPage.jsx`)
- [x] 3.6 Translate `ChatWidget.jsx` live chat drawer

## 4. Admin Panel Multilingual Support

- [x] 4.1 Translate `AdminDashboard.jsx` (KPI titles, 9-step workflow shortcuts)
- [x] 4.2 Translate `AdminProductsPage.jsx` (import modal, SKU table, relaunch button)
- [x] 4.3 Translate `AdminOrdersPage.jsx` (4 procurement tabs, milestone editor modal, color tags, dual remarks)
- [x] 4.4 Translate `AdminAllocationPage.jsx` (split-screen left/right summaries and buyer queue)
- [x] 4.5 Translate `AdminProxyOrderPage.jsx`, `AdminMembersPage.jsx`, `AdminBroadcastPage.jsx`, `AdminFinancePage.jsx`, `AdminReportsPage.jsx`

## 5. Verification & Production Build

- [x] 5.1 Verify seamless runtime switching between `繁體中文` and `English` across all views
- [x] 5.2 Validate `npm run build` production bundling
- [x] 5.3 Verify OpenSpec change validity with `openspec validate configurable-language-support`
