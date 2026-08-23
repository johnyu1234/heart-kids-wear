## Why

The Chrome DevTools Network tab reveals severe performance issues in the Heart Kids Wear production deployment. Key API endpoints like `GET /api/categories` take **3.34–3.58 seconds** to respond, and the same endpoints are called **multiple times redundantly** on a single page navigation. Combined with CORS preflight overhead (326–438ms per request) and missing database indexes, total page load API time reaches **8–10 seconds** — unacceptable for an e-commerce storefront where every second of delay reduces conversions.

## What Changes

- **Add CORS preflight caching**: Set `Access-Control-Max-Age` to cache preflight responses for 1 hour, eliminating ~300-400ms of redundant OPTIONS requests after the first visit
- **Create shared CategoriesContext**: Replace 3 independent `api.get("/categories")` calls in `HomePage`, `ProductListPage`, and `AdminProductsPage` with a single shared React context that caches categories in memory
- **Add products endpoint in-memory cache**: Introduce 30-second TTL in-memory caching for the products list endpoint to avoid repeated SQLAlchemy queries with 3 `joinedload()` chains
- **Cache system config values**: The `calculate_checkout()` service runs 4 separate DB queries to `system_configs` on every `GET /cart` call. Cache these values with a 120-second TTL
- **Add missing database indexes**: Add `index=True` to 6 foreign key columns (`cart_items.member_id`, `cart_items.variant_id`, `wishlist.member_id`, `wishlist.product_id`, `product_images.product_id`, `product_variants.product_id`) used in filtered queries
- **Strip Content-Type on GET requests**: Remove the `application/json` Content-Type header from Axios GET requests to prevent browsers from classifying them as "non-simple" CORS requests

## Capabilities

### New Capabilities
_None — this is a pure performance optimization with no new user-facing capabilities._

### Modified Capabilities
_None — no spec-level behavior changes. All endpoints return the same data with the same contracts; only response latency and internal caching are affected._

> This change is a pure infrastructure/performance refactor. `skip_specs: true` applies.

## Impact

- **Backend files**: `main.py` (CORS config), `api/products.py` (cache), `api/categories.py` (cache TTL), `services/checkout_service.py` (config cache), `models/order.py` (indexes), `models/product.py` (indexes)
- **Frontend files**: New `context/CategoriesContext.jsx`, updated `main.jsx`, `HomePage.jsx`, `ProductListPage.jsx`, `AdminProductsPage.jsx`, `api/client.js`
- **Database**: New indexes created via SQLAlchemy model changes (applied on next `init_db()` restart)
- **No API contract changes**: All endpoints maintain identical request/response schemas
- **No breaking changes**: Existing clients and frontend continue to work identically
