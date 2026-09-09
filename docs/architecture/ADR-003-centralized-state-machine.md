# ADR-003: Centralized Order State Machine in Domain Layer
## Status: Accepted
## Context:
Scattering status transition checks across UI components makes order management unpredictable and hard to audit.
## Decision:
Encapsulate all state transitions inside \eatures/orders/domain/order-state-machine.ts\. UI components only query allowed actions from the domain.
Unassigning a driver is modeled as a dedicated operation (\unassignDriver\), and delivery failure is modeled as \delivery_failed\ with audit reasons.
## Consequences:
- Strict state guarantees and consistent business rules across Customer, Admin, and API layers.
