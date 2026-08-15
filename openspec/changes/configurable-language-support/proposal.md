## Why

Currently, Heart Kids Wear's user interface presents primarily Traditional Chinese (zh-TW) with inline English subtitles. However, customers, international parents, and administrators require full configurable language switching between Traditional Chinese (zh-TW) and English (en-US) across all storefront, checkout, member dashboard, and admin views, with persistence in localStorage and immediate seamless UI re-rendering.

## What Changes

- **i18n Context & Translation Dictionary (`frontend/src/i18n/`)**:
  - Add comprehensive bilingual translation dictionary supporting Chinese (`zh-TW`) and English (`en-US`) keys.
  - Implement React `I18nContext` provider and `useTranslation` hook (`t(key)` helper) with persistent language state in `localStorage`.
- **Configurable Language Selector in Navigation**:
  - Add language toggle switcher button (`繁體中文` / `English`) in both the public header navigation and admin sidebar.
- **Storefront & Member Dashboard Multilingual Support**:
  - Translate all navigation links, announcement banners, product cards, category filters, cart dropdowns, checkout form fields, 7-11 instructions, travel note prompts, and order tracking milestones.
- **Admin Panel Multilingual Support**:
  - Translate all 9 admin management consoles (Dashboard, Products, Orders, Allocation, Proxy Order, Members, Broadcast, Finance, Reports).

## Capabilities

### New Capabilities
- `fe/i18n-language-switcher`: Configurable language switcher with `zh-TW` and `en-US` dictionaries, persistent selection, and reactive translation hooks.

### Modified Capabilities
- `fe/public-storefront`: Storefront pages now consume translation tokens for all titles, buttons, prompts, and modal notices.
- `fe/member-dashboard`: Member center and tracking milestones dynamically render in selected language.
- `fe/admin-panel`: Admin panel headers, table columns, tabs, and action buttons support dynamic language toggle.

## Impact

- **Frontend**:
  - New directory `frontend/src/i18n/` with translation catalogs and `I18nContext.jsx`.
  - Updated layout components: `Header.jsx`, `AnnouncementBar.jsx`, `Footer.jsx`, `MemberSidebar.jsx`, `AdminSidebar.jsx`.
  - Updated page components across public storefront, member dashboard, and admin panel.
- **Backend & Database**: No database schema changes required (products already store both `name_zh` and `name_en`).
