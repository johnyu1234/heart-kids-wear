## Context

Heart Kids Wear is built with React 18 and Vite. Currently, the UI text is hardcoded in Traditional Chinese with partial inline English labels. To provide a first-class internationalized experience for both English-speaking and Taiwanese parents and administrators, we need a lightweight, high-performance i18n architecture without bulky external dependencies.

## Goals / Non-Goals

**Goals:**
- Implement a lightweight, reactive `I18nContext` in React providing `t(key, fallback)` function and language switcher.
- Support `zh` (繁體中文, default) and `en` (English) locales.
- Persist language preference in `localStorage` (`heart_kids_wear_lang`).
- Provide language switchers in both public Header and Admin Sidebar.
- Fully translate all storefront, member center, live chat, and admin console UI text.
- Fallback gracefully to Chinese if an English key is missing, or vice versa.

**Non-Goals:**
- Translating user-submitted free-text order remarks or dynamic chat messages on the fly (translation applies to system UI and catalog attributes).

## Decisions

### 1. Custom Lightweight I18n Context vs. External react-i18next
- **Decision**: Build a native, clean `I18nContext` with `translations.js` dictionary in `frontend/src/i18n/`.
- **Rationale**: Avoids adding heavy bundle overhead while providing total flexibility, fast initialization, instant reactivity, and seamless integration with existing React context tree (`AuthProvider`, `CartProvider`, `NotificationProvider`).

### 2. Translation Dictionary Structure
- **Decision**: Key-path structured dictionary categorized by module (e.g. `nav.home`, `announcement.text`, `product.preorder`, `checkout.shipping_711`, `admin.dashboard.title`).

### 3. Language Switcher UI Placement
- **Decision**: Place an interactive globe icon dropdown / toggle button in the Header next to the cart, and at the top/bottom of the Admin Sidebar.

## Risks / Trade-offs

- **[Risk] Missing translation key** → **Mitigation**: `t(key, fallback)` helper returns the provided fallback string or key name if the translation lookup fails.
