# Proposal: Product Catalog & Categories API (BE)

## Why
Customers must filter products by gender and age group, sort by price (low to high / high to low), view brand campaigns with promotional copy, inspect size charts, and select size variants with unique SKUs. Admins must import, update, archive, and relaunch items with single-click actions.

## What Changes
- `GET /api/categories` returning two-tier category hierarchy.
- `GET /api/products` supporting category filters, campaign IDs, keywords, and `price_asc` / `price_desc` sorting.
- `GET /api/products/{id}` with complete variant SKU array and size chart.
- `GET /api/products/campaign/{id}` for group buying brand campaigns.
- Admin mutations (`POST /api/admin/products/import`, `POST /api/admin/products/update`, `POST /api/admin/products/archive`, `POST /api/admin/products/relaunch`).
- Wishlist endpoints (`GET /api/wishlist`, `POST /api/wishlist/add`, `POST /api/wishlist/remove`).

## Impact
- Core product catalog and inventory data service for the web app.
