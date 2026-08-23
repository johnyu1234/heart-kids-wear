## Context

See proposal.md for motivation. The current architecture has no caching layer between the React frontend and the FastAPI/Supabase backend. Every page navigation triggers fresh API calls, and the Render (Singapore) → Supabase (Sydney) round-trip adds ~300-500ms of base latency per database query. Categories and products are read-heavy, rarely-mutated data ideal for in-memory caching.

Key current state:
- `GET /api/categories`: Has a 60s in-memory cache but the frontend calls it independently from 3 different components
- `GET /api/products`: No caching, runs 3 `joinedload()` chains per request
- `GET /api/cart`: Calls `calculate_checkout()` which runs 4 `system_configs` DB queries per invocation
- CORS middleware has no `max_age` setting, causing the browser to send a preflight OPTIONS request before every XHR
- 6 foreign key columns used in queries lack database indexes

## Goals / Non-Goals

**Goals:**
- Reduce perceived page load time from ~8-10s to ~1-2s for returning visitors
- Eliminate redundant duplicate API calls on page navigation
- Cache CORS preflight to remove ~300-400ms overhead per request after first visit
- Add database indexes for query performance at scale

**Non-Goals:**
- Redis or external cache service (overkill for current traffic; simple Python dict cache is sufficient)
- CDN-level API caching (Cloudflare Workers, Vercel Edge) — future optimization
- Server-Side Rendering (SSR) or static generation
- Changing any API request/response contracts

## Decisions

### 1. In-memory dict cache over Redis
**Decision**: Use Python `dict` with TTL timestamps for backend caching.
**Rationale**: The app runs as a single Uvicorn process on Render free tier. An in-process dict cache has zero latency overhead and zero infrastructure cost. Redis would add a $15/month service dependency and network hop for a workload that currently has ~3 products and ~10 users.
**Alternative considered**: `cachetools.TTLCache` — adds a dependency for marginal benefit over a simple dict+timestamp pattern we already use in `categories.py`.

### 2. React Context for categories over React Query / SWR
**Decision**: Create a simple `CategoriesContext` provider with `useCategories()` hook.
**Rationale**: Categories are static, rarely-changing data (admin adds a category maybe once a month). A lightweight context with a fetch-once-per-session pattern eliminates 2-4 duplicate `/categories` calls per navigation without adding a dependency. React Query would be ideal for a larger app but adds 40KB+ to the bundle for a problem solved by 30 lines of context code.
**Alternative considered**: React Query with `staleTime: Infinity` — more powerful but adds a new dependency and learning curve.

### 3. Strip Content-Type on GET requests via Axios interceptor
**Decision**: Add a request interceptor that removes `Content-Type: application/json` from GET requests.
**Rationale**: Browsers classify requests with custom headers as "non-simple" CORS requests, triggering a preflight OPTIONS round-trip. GET requests don't send a body, so `Content-Type` is meaningless. Removing it lets browsers send GET requests as "simple" CORS requests, skipping the preflight entirely.
**Alternative considered**: Moving to `fetch()` API — would require rewriting all API calls.

### 4. `Access-Control-Max-Age: 3600` for remaining preflights
**Decision**: Add `max_age=3600` (1 hour) to FastAPI's `CORSMiddleware`.
**Rationale**: POST requests still require preflight (they send JSON body), but the preflight result can be cached by the browser for 1 hour. This means a user who adds items to cart, checks out, etc. only pays the preflight cost once per hour instead of on every mutation.

### 5. Database indexes via SQLAlchemy model `index=True`
**Decision**: Add `index=True` to 6 foreign key columns in SQLAlchemy models.
**Rationale**: SQLAlchemy's `create_all()` (called in `init_db()`) will create the indexes on next restart. For Supabase PostgreSQL, the `CREATE INDEX IF NOT EXISTS` is idempotent. The columns are all used in `WHERE` or `JOIN` clauses in hot paths (cart queries, wishlist lookups, product image loading).

### 6. Cache-busting strategy: TTL-only (no explicit invalidation)
**Decision**: Use short TTLs (30s products, 60s categories, 120s system config) rather than explicit cache invalidation on mutations.
**Rationale**: With only 1 admin user and ~3 products, the worst case is a 30-second stale window after a product update. This is far simpler than wiring cache invalidation into every mutation endpoint. If the catalog grows significantly, explicit invalidation can be added later.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Stale data shown for up to 30-60s after admin edits | Acceptable for current scale; admin can wait or refresh. TTLs are short enough that staleness is brief |
| In-memory cache lost on Render cold start | This is actually beneficial — cold start always serves fresh data. Cache rebuilds within 1-2 requests |
| Indexes add slight write overhead on INSERT/UPDATE | Negligible for a pre-order store with ~10 orders/day. Read performance gains far outweigh write costs |
| `React.StrictMode` double-renders may cause double fetches in dev | Only affects development mode. Production builds don't double-render. The shared context prevents actual duplicate API calls |
