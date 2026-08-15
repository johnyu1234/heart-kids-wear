## Purpose

Governs store credit auto-refund execution on stockout, ad-hoc points card distribution, and automated background schedulers for payment deadline escalations and points expiry.

## ADDED Requirements

### Requirement: Automatic Store Credit Refund on Item Discontinuation
When an administrator sets `discontinued_date` or status `OUT_OF_STOCK` on an order item, the backend service SHALL automatically credit `unit_price * quantity` to the purchasing member's `store_credits`, record a `STOCKOUT_REFUND` event in `member_events`, and send a notification message.

#### Scenario: Auto-Crediting Refund on Stockout
- **WHEN** admin updates an item's status to OUT_OF_STOCK via the logistics API
- **THEN** backend increments member's store credit balance, writes audit log into `member_events`, and returns updated credit balance

### Requirement: Ad-Hoc Points Cards Issuance API
The backend SHALL expose `POST /api/admin/members/issue-points` allowing administrators to issue points cards with custom amount and expiration date to specific or all members.

#### Scenario: Admin Issuing Lucky Draw Points Card
- **WHEN** admin posts `{ "member_id": 4, "amount": 100, "expiry_date": "2026-07-31" }` to `POST /api/admin/members/issue-points`
- **THEN** backend creates a `points_cards` record linked to member 4 with the specified expiration timestamp

### Requirement: Automated 4-Stage Payment Escalation Pipeline
The background scheduler SHALL execute daily to evaluate unpaid orders against payment deadlines and transition them through stages: Day 0 deadline reminder, Day 1 grace lock (manual bank transfer with 3-day timer), Day 3-4 final notice, and Day 4+ abandonment (releasing stock and logging overdue penalty).

#### Scenario: Scheduled Execution of Overdue Pipeline
- **WHEN** scheduler runs at midnight
- **THEN** orders past payment deadline are updated to `OVERDUE_GRACE` with manual transfer restrictions and automated notification triggers
