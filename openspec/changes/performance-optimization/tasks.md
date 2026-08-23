## 1. Backend — CORS Preflight Caching

- [x] 1.1 Add `max_age=3600` to `CORSMiddleware` in `backend/app/main.py` to cache preflight responses for 1 hour

## 2. Backend — Products Endpoint Cache

- [x] 2.1 Add 30-second in-memory TTL cache to `GET /api/products` in `backend/app/api/products.py` (cache key: `category_id`, `campaign_id`, `sort`, `search`)
- [x] 2.2 Verify cache correctly serves different query parameter combinations without mixing results

## 3. Backend — System Config Cache

- [x] 3.1 Add 120-second in-memory cache for `get_system_config()` in `backend/app/services/checkout_service.py` to eliminate 4 DB queries per `GET /cart`

## 4. Backend — Database Indexes

- [x] 4.1 Add `index=True` to `cart_items.member_id` and `cart_items.variant_id` in `backend/app/models/order.py`
- [x] 4.2 Add `index=True` to `wishlist.member_id` and `wishlist.product_id` in `backend/app/models/order.py`
- [x] 4.3 Add `index=True` to `product_images.product_id` and `product_variants.product_id` in `backend/app/models/product.py`
- [x] 4.4 Restart backend to trigger `create_all()` which creates the new indexes on Supabase PostgreSQL

## 5. Frontend — Shared Categories Context

- [x] 5.1 Create `frontend/src/context/CategoriesContext.jsx` with `CategoriesProvider` and `useCategories()` hook (fetch-once-per-session with in-memory state)
- [x] 5.2 Wrap `<App />` with `<CategoriesProvider>` in `frontend/src/main.jsx`
- [x] 5.3 Refactor `HomePage.jsx` to use `useCategories()` instead of independent `api.get("/categories")`
- [x] 5.4 Refactor `ProductListPage.jsx` to use `useCategories()` instead of independent `api.get("/categories")`
- [x] 5.5 Refactor `AdminProductsPage.jsx` to use `useCategories()` instead of independent `api.get("/categories")`

## 6. Frontend — Axios GET Preflight Elimination

- [x] 6.1 Add request interceptor in `frontend/src/api/client.js` to strip `Content-Type` header on GET requests, preventing "non-simple" CORS classification

## 7. Verification

- [x] 7.1 Restart backend and verify new database indexes are created (check Render logs for `CREATE INDEX`)
- [x] 7.2 Open Chrome DevTools Network tab and verify: no duplicate `/categories` calls, preflight responses cached, products endpoint responds in <100ms on cache hit
- [x] 7.3 Commit all changes and push to GitHub
- [x] 7.4 Verify Render and Vercel deployments succeed
