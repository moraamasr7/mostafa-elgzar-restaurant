# ADR-002: Live Menu with No Automatic Offline Fallback
## Status: Accepted
## Context:
In previous iterations, \data/menu.ts\ was used as an automatic fallback when network requests failed. This silently showed stale prices.
## Decision:
Remove \data/menu.ts\ as an automated runtime fallback. The application renders a Graceful Error State with retry and direct telephone ordering buttons when database queries fail.
## Consequences:
- Zero risk of displaying outdated pricing.
- Any future offline capability must be version-controlled and explicitly synced.
