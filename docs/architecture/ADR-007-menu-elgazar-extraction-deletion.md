# ADR-007: Temporary Extraction & Clean Deletion of Menu_Elgazar
## Status: Accepted
## Context:
\Menu_Elgazar\ was an isolated prototype repository. Long-term maintenance of two repositories causes drift and duplication.
## Decision:
Use \Menu_Elgazar\ strictly as a temporary reference to extract valid business logic into \mostafa-elgzar-restaurant\. After complete verification, delete \Menu_Elgazar\ permanently with 0 lingering references.
## Consequences:
- A single clean repository deployed to GitHub and Vercel.
- Zero debt or residual dependencies.
