# Heart Kids Wear (心童裝) Platform — Implementation Walkthrough

We have completed the full-stack pre-order e-commerce platform for **Heart Kids Wear (心童裝)** following the OpenSpec `opsx-apply` workflow.

---

## 1. System Architecture & Work Completed

### A. Database (DB) Layer
*   **Database Engine**: SQLite with WAL mode (`journal_mode=WAL`) and Foreign Key enforcement (`PRAGMA foreign_keys = ON;`) in [`database.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/database.py).
*   **19 Relational Models**:
    *   **User & CRM**: [`Member`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/user.py), [`ShippingAddress`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/user.py), [`MemberEvent`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/user.py).
    *   **Catalog & Campaigns**: [`Category`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/product.py), [`GroupCampaign`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/product.py), [`Product`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/product.py), [`ProductVariant`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/product.py), [`ProductImage`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/product.py).
    *   **Orders & Fulfillment**: [`Order`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/order.py), [`OrderItem`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/order.py), [`PaymentRecord`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/order.py), [`CartItem`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/order.py), [`Wishlist`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/order.py).
    *   **Finance & Messaging**: [`Message`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/finance.py), [`MessageTemplate`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/finance.py), [`PointsCard`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/finance.py), [`ExpenseLedger`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/finance.py), [`IncomeLedger`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/finance.py), [`SystemConfig`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/models/finance.py).
*   **Seed Fixtures**: [`db_init.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/db_init.py) creates all tables and populates system configs, 2-tier categories, official message templates, admin account, and demo products with variants.

---

### B. Backend (BE) Layer
*   **API Design**: Strict `GET` (reads) and `POST` (writes/mutations). No `PUT`/`DELETE`.
*   **Security & ID Generators**: Native `bcrypt` password hashing, JWT authentication, sequential order ID generator (`YYMM0001`), and member code generator (`YYMM004`).
*   **Core Services**:
    *   [`checkout_service.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/services/checkout_service.py): 7-11 NT$60 / Post Office NT$80 with >15 items auto-lock, NT$4,000 threshold NT$60 discount, store credits and points card deduction.
    *   [`credit_service.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/services/credit_service.py): 100% auto-refund to `store_credits` (永久有效) on item discontinuation + in-app notification.
    *   [`notification_service.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/services/notification_service.py): Template placeholder renderer (`{{name}}`, `{{tracking}}`, `{{date}}`) and live chat welcome reply.
    *   [`scheduler_service.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/app/services/scheduler_service.py): 4-stage payment deadline escalation (Day 0 reminder → Day 1 grace lock → Day 3 warning → Day 4+ abandonment & penalty logging).
*   **API Routers**:
    *   Customer: `auth.py`, `members.py`, `categories.py`, `products.py`, `wishlist.py`, `cart.py`, `checkout.py`, `orders.py`, `messages.py`.
    *   Admin: `admin/products.py`, `admin/orders.py`, `admin/members.py`, `admin/messages.py`, `admin/finance.py`.
*   **Automated Tests**: 100% passing pytest integration test suite in [`test_api.py`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/backend/tests/test_api.py).

---

### C. Frontend (FE) Layer
*   **Tech Stack**: React 18 + Vite + Vanilla CSS design system.
*   **Design System & Layout**:
    *   [`index.css`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/index.css): Warm terracotta boutique aesthetic (`--primary-heart: #E05D5D`), fluid typography (Google Fonts Noto Sans TC, Outfit, Quicksand), badges, cards, and modal animations.
    *   [`AnnouncementBar.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/components/layout/AnnouncementBar.jsx): 60-point registration banner.
    *   [`Header.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/components/layout/Header.jsx) & [`CartDropdown.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/components/layout/CartDropdown.jsx): Real-time cart preview dropdown, search bar, wishlist link, and red dot notification badges.
    *   [`ChatWidget.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/components/chat/ChatWidget.jsx): Floating drawer for customer-admin live chat.
*   **Storefront Pages**:
    *   [`HomePage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/HomePage.jsx), [`ProductListPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/ProductListPage.jsx), [`ProductDetailPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/ProductDetailPage.jsx), [`LoginPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/LoginPage.jsx), [`RegisterPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/RegisterPage.jsx), [`CartPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/CartPage.jsx), [`CheckoutPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/CheckoutPage.jsx), [`TermsPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/TermsPage.jsx), [`ForgotPasswordPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/public/ForgotPasswordPage.jsx).
*   **Member Dashboard**:
    *   [`OrderHistoryPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/member/OrderHistoryPage.jsx), [`ProfilePage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/member/ProfilePage.jsx), [`WishlistPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/member/WishlistPage.jsx), [`MessagesPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/member/MessagesPage.jsx).
*   **Admin Panel (9 Core Views)**:
    *   [`AdminDashboard.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminDashboard.jsx) (營運數據與快速入口)
    *   [`AdminProductsPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminProductsPage.jsx) (商品與獨立 SKU 貨號、英鎊原價、一鍵重新開團)
    *   [`AdminOrdersPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminOrdersPage.jsx) (4 大分頁：未訂購/未到貨/未出貨/處理中、自訂日期格式 `YYYY/MM/DD(n)`、箱號顏色標籤、雙軌備註)
    *   [`AdminAllocationPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminAllocationPage.jsx) (左右分屏配貨分貨，依下單精準時間排序撮合買家)
    *   [`AdminProxyOrderPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminProxyOrderPage.jsx) (管理員手動代客下單)
    *   [`AdminMembersPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminMembersPage.jsx) (買家 CRM、行為標籤例如「愛遲繳」、手動發放點數卡)
    *   [`AdminBroadcastPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminBroadcastPage.jsx) (官方範本管理、`{{name}}`/`{{tracking}}` 動態變數群發推播)
    *   [`AdminFinancePage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminFinancePage.jsx) (末 5 碼對帳核銷、國際空運材積公式記帳 `長×寬×高/5000`、支出帳本)
    *   [`AdminReportsPage.jsx`](file:///c:/Users/johny/Desktop/Projects/heart-kids-wear/frontend/src/pages/admin/AdminReportsPage.jsx) (含運/不含運營收、採購成本、期內淨利、AOV 客單價報表)

---

## 2. Verification Summary

1.  **Backend Pytest Suite**:
    ```bash
    python -m pytest backend/tests/test_api.py -v
    # Result: 7 passed in 1.91s
    ```
2.  **Frontend Production Build**:
    ```bash
    npm run build
    # Result: built in 1.97s (0 errors)
    ```
3.  **OpenSpec Validation**:
    ```bash
    openspec validate heart-kids-wear-platform
    # Result: Change 'heart-kids-wear-platform' is valid
    ```
