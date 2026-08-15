## Purpose

Provides product catalog endpoints, two-tier category filtering, price sorting, brand group campaign queries, size chart retrieval, and admin product mutation APIs.

## ADDED Requirements

### Requirement: Product Browsing with 2-Tier Filtering and Sorting API
The backend SHALL expose `GET /api/products` accepting optional query parameters for `category_id` (Tier 1/Tier 2), `campaign_id`, `sort` (`price_asc` or `price_desc`), and `search` query.

#### Scenario: Querying Products Sorted by Price Ascending
- **WHEN** client requests `GET /api/products?category_id=2&sort=price_asc`
- **THEN** backend returns listed products under category 2 ordered by `retail_price_twd` ascending

### Requirement: Product Detail API with Variant SKUs and Size Chart
The backend SHALL expose `GET /api/products/{id}` returning complete product details including Chinese/English names, description, image gallery list, size chart URL, and all available variants with distinct SKU codes and stock quantities.

#### Scenario: Retrieving Single Product Detail
- **WHEN** client requests `GET /api/products/1`
- **THEN** backend returns product details alongside its full variant array with independent SKUs

### Requirement: Admin Product Import and Mutation Endpoints
The backend SHALL expose `POST /api/admin/products/import`, `POST /api/admin/products/update`, `POST /api/admin/products/archive`, and `POST /api/admin/products/relaunch` (all using POST verb, no PUT/DELETE).

#### Scenario: Admin Importing New Product with Variants
- **WHEN** admin posts product payload with multiple size variants to `POST /api/admin/products/import`
- **THEN** backend creates product record, creates distinct variant SKU records, and returns the created product ID

#### Scenario: Admin Archiving and Relaunching Product
- **WHEN** admin posts `{ "product_id": 5 }` to `POST /api/admin/products/archive`
- **THEN** backend sets `is_listed = false, is_archived = true` without deleting the underlying record
