# Proposal: Authentication & Member Profile API (BE)

## Why
Customers must securely register with full ID-matching details and preferred 7-11 stores, log in reliably without case-sensitivity friction, manage multiple delivery addresses, and track remaining loyalty points and store credits.

## What Changes
- `POST /api/auth/register` with mandatory 7-11 delivery store details, marketing acquisition survey (FB/IG/LINE handle), and rules agreement.
- `POST /api/auth/login` with case-insensitive email normalization and password hash verification.
- `POST /api/auth/forgot-password` and `POST /api/auth/verify-code`.
- `GET /api/members/profile` and `POST /api/members/profile/update` (strictly POST, legal name immutable).
- `GET /api/members/points` and `GET /api/members/credits`.

## Impact
- Powers customer onboarding, authentication sessions, and profile dashboard.
