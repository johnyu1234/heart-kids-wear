# ❤️ Heart Kids Wear (心童裝)

> **UK Direct Kids' Fashion Pre-Order E-Commerce & Operations Management Platform**  
> 專為英國專櫃高品質有機純棉與設計師童裝打造的預購電商平台與 9 步驟標準化營運後台系統。

---

## 🌟 Features Overview

### 🛍️ Customer Storefront & Member Portal
- **Group-Buy Catalog & SKU Selector**: Multi-size variant picker (`2-3y`, `3-4y`, `4-5y`) with real-time stock counters.
- **New Member Welcome Gift**: Automatic **NT$60 Points Card** issued upon registration, redeemable for 7-11 free shipping.
- **Pre-Order Checkout**:
  - Supports **7-11 店到店 (C2C)** and **中華郵政宅配** delivery methods.
  - Automatic shipping discount calculations (Single order $\ge$ NT$4,000 earns NT$60 off).
  - Out-of-country / vacation departure note entry (`✈️ 出國請假備註`).
  - Pre-order shopping terms and agreement validation with in-app `UIModal` popups.
- **預購進度查詢 (Live Milestone Tracker)**:
  - **2-Column Responsive Layout**: Left-skewed order items table + Right-side sticky financial summary card.
  - **8-Stage Collapsible Dropdown Stepper**:
    1. 📝 預購已建立 (Order Placed)
    2. 💳 付款確認與對帳 (Payment Confirmed)
    3. 🇬🇧 英國原廠下單 (UK Procured)
    4. 🏢 英國集貨倉到貨 (Arrived at UK Hub)
    5. ✈️ 國際空運直飛 (Intl Transit)
    6. 🛃 台灣海關清關 (Customs Cleared)
    7. 📦 台灣在地出貨 (Domestic Dispatched)
    8. 🎉 買家取件完成 (Completed)
- **ATM Bank Transfer Notification**: Customer self-reporting of last 5 digits (`末 5 碼`) with in-app confirmation modal.
- **Live Customer Support**: In-app messaging thread with automated welcome responses and read-state synchronization.

---

### 💼 Admin Operations Panel (9-Step Standardized Workflow)
1. **儀表板總覽 (Dashboard Overview)**: Live revenue KPIs, estimated net profit, AOV, and pending procurement counters.
2. **商品與規格管理 (Products & SKUs)**: Multi-size SKU auto-generation, custom cost pricing (£/TWD), and one-click archiving.
3. **採購出貨 4 分頁 (Procurement & Logistics)**: 未訂購 / 本期到貨 / 本期出貨 / 處理中 4-stage Kanban workflow.
4. **配貨分貨 (Split-Screen Allocation)**: Left-side product demand list + Right-side customer matching and allocation.
5. **手動代客下單 (Proxy Order Placement)**: Line/IG direct manual order entry for VIP customers.
6. **會員 CRM 與標籤 (Member CRM)**: Customer purchase history, loyalty credits, custom remark notes, and blacklist safety controls.
7. **範本群發與推播 (Broadcast Messaging)**: Dynamic variable injection ({{name}}, {{tracking}}, {{month}}) for personalized batch broadcasts.
8. **對帳與運費公式記帳 (Reconciliation & Freight)**: ATM last-5 auditing and volumetric weight freight calculator ($\text{Length} \times \text{Width} \times \text{Height} / 5000 \times \text{Rate}$).
9. **財務與銷售報表 (Financial Analytics)**: Complete expense and revenue ledger with exportable summaries.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 18 + Vite | Single Page Application with optimized fast refresh |
| **Styling** | Vanilla CSS Design Tokens | Curated HSL palette, soft gradients, glassmorphism, responsive grid |
| **Icons** | Lucide React | Modern lightweight SVG icons |
| **Localization** | Custom i18n Context | Traditional Chinese (zh-TW) and English (en) |
| **Timezone** | Asia/Taipei (UTC+8) | Standardized Taiwan local time and UTF-8 formatting |
| **Backend API** | FastAPI (Python 3.10+) | High-performance RESTful API with auto OpenAPI/Swagger docs |
| **ORM & DB** | SQLAlchemy + SQLite | Relational database with automatic seed initialization |
| **Testing** | Playwright E2E | Zero-pollution test suites with automated DB snapshot & rollback |
| **Tunneling** | ngrok v3 | Secure HTTPS public exposure for mobile testing |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/johnyu1234/heart-kids-wear.git
cd heart-kids-wear

# Install Root & Frontend dependencies
npm install
cd frontend && npm install && cd ..

# Install Python Backend dependencies
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] python-multipart requests
```

---

### 3. Running the Development Servers

#### Start the Backend API (Port 8000)
```powershell
python -m uvicorn backend.app.main:app --port 8000
```
*API documentation available at: `http://localhost:8000/docs`*

#### Start the Frontend UI (Port 5173)
```powershell
npm run dev
```
*Frontend available at: `http://localhost:5173`*

---

### 4. Remote Device & Mobile Sharing via ngrok

To expose your local instance to other devices (e.g. phones or external clients):

```powershell
npm run ngrok
```
*Or access directly on your local Wi-Fi network at `http://<YOUR_LOCAL_IP>:5173`.*

---

## 🧪 End-to-End (E2E) Test Suites

Heart Kids Wear includes comprehensive Playwright browser test suites with **automated SQLite database backup and zero-pollution rollback**:

```bash
# Run all customer authentication and route restriction tests
npm run test:e2e

# Run complete customer journey test (Catalog -> Cart -> Checkout -> Milestones -> Chat)
npm run test:customer

# Run admin authentication and route guard tests
npm run test:admin

# Run full admin operations test (SKU creation, CRM, Proxy Order, Freight, Broadcast)
npm run test:admin:ops
```

*Add `:headed` to watch test runs live in a visible browser window (e.g., `npm run test:customer:headed`).*

---

## 📄 License
Heart Kids Wear (心童裝) © 2026. All rights reserved.
