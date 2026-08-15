## Purpose

Provides backend authentication, JWT session management, member profile queries/updates, address book handling, and event timeline logging.

## ADDED Requirements

### Requirement: Member Registration with Survey and 7-11 Data
The backend SHALL expose `POST /api/auth/register` to register a new member with mandatory delivery store details, marketing acquisition survey (FB/IG/LINE handle), and shopping rules agreement, automatically crediting a 60-point registration bonus card.

#### Scenario: Successful API Registration
- **WHEN** client posts valid registration payload to `POST /api/auth/register`
- **THEN** backend hashes password, creates `members` record, inserts primary `shipping_addresses` record, generates 60-point `points_cards` record, and returns a JWT access token

### Requirement: Case-Insensitive Email Login API
The backend SHALL expose `POST /api/auth/login` to authenticate users by converting the supplied email to lowercase prior to database query.

#### Scenario: User Logging in with Mixed-Case Email
- **WHEN** client sends email `Buyer@HeartKids.com` and valid password to `POST /api/auth/login`
- **THEN** backend matches account with `buyer@heartkids.com` and returns JWT authentication token

### Requirement: Member Profile Retrieval and Update API
The backend SHALL expose `GET /api/members/profile` and `POST /api/members/profile/update` (strictly POST, no PUT), prohibiting modifications to the member's legal name while allowing updates to shipping addresses, contact address, email, and password.

#### Scenario: Updating Member Shipping Preferences
- **WHEN** authenticated member sends updated address payload to `POST /api/members/profile/update`
- **THEN** backend updates the address records and returns the updated member profile

### Requirement: Member Points and Credits Query Endpoints
The backend SHALL expose `GET /api/members/points` and `GET /api/members/credits` returning active points cards, expiration dates, and total available store credit balance.

#### Scenario: Fetching Active Balance
- **WHEN** member requests `GET /api/members/credits`
- **THEN** backend returns total non-expired store credits and active points breakdown
