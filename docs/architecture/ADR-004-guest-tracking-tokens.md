# ADR-004: Guest Ordering with Cryptographic Tracking Tokens
## Status: Accepted
## Context:
End-customers ordering food need frictionless ordering without mandatory account creation or password friction, while maintaining strict order privacy.
## Decision:
Orders are created anonymously via \create_order_secure\ which generates a high-entropy \	racking_token\. Customers view their live order via \/order/[id]?token=[tracking_token]\.
Admin dashboard uses authenticated sessions.
## Consequences:
- High conversion rates for hungry customers.
- Strong privacy: order details are inaccessible without the token.
