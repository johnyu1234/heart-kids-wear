# Proposal: Live Chat & Broadcast Messaging API (BE)

## Why
Customers need immediate welcome guidance when inquiring via the floating live chat widget. Admins need tools to send direct targeted messages with read/unread tracking and broadcast bulk communications with dynamic template variable replacement (`{{name}}`, `{{tracking}}`).

## What Changes
- Customer chat endpoints (`GET /api/messages`, `POST /api/messages/send`) with automated canned welcome replies.
- Unread badge counter endpoint (`GET /api/messages/unread-count`, `POST /api/messages/mark-read`).
- Admin individual and bulk broadcast endpoints (`POST /api/admin/messages/send-individual`, `POST /api/admin/messages/send-bulk`).
- Template management endpoints (`GET /api/admin/messages/templates`, `POST /api/admin/messages/templates/create`).

## Impact
- Powers customer-store communications and automated logistics notification delivery.
