# ADR-001: Supabase as Single Source of Truth
## Status: Accepted
## Context:
The restaurant platform requires accurate, live pricing and availability for all dishes and size variants. Serving stale or mismatched items from local static files creates customer disputes and operational losses.
## Decision:
Supabase database view \_full_menu\ is the single authoritative source of truth for the menu.
## Consequences:
- Client applications will not maintain an independent duplicate list of menu items.
- If Supabase is unreachable, the system shows a friendly operational error state rather than wrong prices.
