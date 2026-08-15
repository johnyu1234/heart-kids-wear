# Proposal: Store Credits, Points & Automated Scheduler Services (BE)

## Why
When pre-ordered items are discontinued by UK suppliers, the platform must automatically refund 100% of the cost into the member's permanent store credit balance, notify the customer, and log the event. Schedulers must also automate the 4-stage payment escalation pipeline and product publishing.

## What Changes
- Automatic store credit refund service in `backend/app/services/credit_service.py` triggered upon item stockout.
- `POST /api/admin/members/issue-points` for issuing ad-hoc points cards with individual expiry dates.
- 4-stage payment deadline escalation background scheduler (Day 0 reminder, Day 1 grace lock to manual transfer, Day 3-4 final warning, Day 4+ abandonment & penalty logging).
- Scheduled product publishing and delisting background cron worker.

## Impact
- Protects customer balance integrity and automates administrative payment reminders.
