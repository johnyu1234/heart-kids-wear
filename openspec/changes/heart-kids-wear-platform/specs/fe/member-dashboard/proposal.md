# Proposal: Member Account Portal & Dialogue Center (FE)

## Why
Logged-in members need a split-column dashboard to review their pre-order histories (with sequential columns, pre-order status pills, and customer-visible remarks), click 7-11 logistics tracking codes, review message history with the store, manage shipping address preferences, and monitor points and store credits.

## What Changes
- Split-column `MemberLayout` with sidebar navigation (Orders history, Buy again, Messages, My Account, Log out).
- `OrdersPage` with sequential layout: Photo > Name > Style > Spec > Quantity > Pre-order Status (In Progress, Registered, Out of Stock), customer remarks, and 7-11 tracking links.
- `AccountPage` with immutable basic info (legal name, DOB) and editable address preferences, email, password, and credit balance.
- `MessagesPage` for full dialogue history.
- `WishlistPage` displaying saved products.

## Impact
- Customer account retention and self-service tracking interface.
