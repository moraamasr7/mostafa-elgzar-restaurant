# ADR-006: Removal of Static Export Constraint
## Status: Accepted
## Context:
The main repository previously defined \output: 'export'\ in \
ext.config.js\. This prohibits Serverless Route Handlers (\/api/orders\) and server-side operations needed for Turnstile verification and rate-limiting.
## Decision:
Remove \output: 'export'\ and \distDir: 'dist'\ to enable hybrid Serverless capabilities on Next.js / Vercel.
## Consequences:
- Dynamic API routes are fully supported.
- Static pages retain high performance and incremental rendering.
