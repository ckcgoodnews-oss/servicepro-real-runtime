# ServicePro 8.0.0-alpha.1 — PostgreSQL Certification

**Database engine tested:** PostgreSQL 16.14  
**Result:** Pass

## Evidence

| Test | Result |
|---|---|
| Start from an empty database | Pass |
| Apply complete migration history | Pass — 685 migrations |
| Re-run migrations | Pass — idempotent, 685 skipped |
| Readiness and authenticated login | Pass |
| Dashboard query | Pass |
| Customer creation/read | Pass |
| Job/work-order creation/read | Pass |
| Technician creation/read | Pass |
| Appointment and dispatch persistence | Pass |
| CRM lead persistence | Pass |
| Marketing campaign persistence | Pass |
| Invoice creation | Pass |
| Partial payment and remaining balance | Pass |
| Final payment and paid status | Pass |
| Payment audit-event persistence | Pass — 2 events |
| Cross-tenant customer visibility | Pass — record hidden |
| Logical backup with `pg_dump` | Pass |
| Restore into a separate database | Pass |
| Critical row-count comparison | Pass |
| Authenticated smoke against restored database | Pass |

## Defects corrected during certification

- Migration 779 assumed columns from a newer CRM model even when the historical Sprint 46 tables already existed. It now upgrades additively and normalizes tenant ownership.
- Migration 780 required the undeclared `vector` extension although the application stores but does not execute vector-distance queries. Embeddings now use portable `jsonb`, removing an undeclared deployment dependency.
- PostgreSQL CRM and marketing repositories now execute real database operations instead of relying on incompatible legacy shapes.

The disposable databases and containers used for this certification are not production assets.
