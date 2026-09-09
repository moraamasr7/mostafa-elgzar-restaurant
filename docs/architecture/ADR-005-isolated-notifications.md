# ADR-005: Decoupled & Isolated Notification Engine
## Status: Accepted
## Context:
Third-party notification services (like Telegram Bot API) can experience network delays, timeouts, or transient outages. Tightly coupling notification dispatch inside the order creation transaction can cause orders to fail or client requests to hang.
## Decision:
Decouple notifications via an in-process event pattern: Order committed -> Return success to customer -> Asynchronously trigger \NotificationService\ -> \TelegramAdapter\.
## Consequences:
- If Telegram fails, the order succeeds 100% and the failure is logged without blocking the customer.
- Extensible to WhatsApp, SMS, or Push notifications without touching order logic.
