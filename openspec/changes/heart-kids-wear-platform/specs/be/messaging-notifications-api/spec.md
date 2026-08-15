## Purpose

Handles customer live chat with automated canned responses, unread message badges, and admin bulk broadcasts with dynamic template variable injection.

## ADDED Requirements

### Requirement: Customer Message API with Automatic Canned Response
The backend SHALL expose `GET /api/messages` and `POST /api/messages/send`, and SHALL automatically reply with the official canned welcome message when a customer sends a message.

#### Scenario: Customer Inquiring via Live Chat API
- **WHEN** customer posts a new message to `POST /api/messages/send`
- **THEN** backend saves the customer message and automatically creates a response message containing the canned welcome instructions

### Requirement: Unread Message Badge API
The backend SHALL expose `GET /api/messages/unread-count` and `POST /api/messages/mark-read` to power the frontend unread red notification badge.

#### Scenario: Fetching Unread Message Count
- **WHEN** authenticated customer requests `GET /api/messages/unread-count`
- **THEN** backend returns the integer count of unread messages addressed to the user

### Requirement: Admin Bulk Broadcast API with Variable Parsing
The backend SHALL expose `POST /api/admin/messages/send-bulk` accepting a list of recipient member IDs and a template containing placeholders (`{{name}}`, `{{tracking}}`, `{{month}}`), automatically parsing and dispatching individualized messages.

#### Scenario: Broadcasting 7-11 Shipping Notices
- **WHEN** admin posts a broadcast request with 10 recipient IDs using the 7-11 shipping template
- **THEN** backend dynamically injects each recipient's name and order tracking code and creates individual message records
