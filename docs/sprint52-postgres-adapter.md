# Sprint 52 - PostgreSQL Adapter Contracts

This sprint prepares the runtime to switch from JSON to PostgreSQL.

Implemented:
- `DATA_STORE=json|postgres`
- Store provider factory.
- JSON adapter.
- PostgreSQL adapter contract.
- Customer repository factory.
- Job repository factory.
- PostgreSQL customers/jobs target migration.
- Environment validation.

The PostgreSQL adapter intentionally declares the runtime surface but does not yet use the `pg` package. Sprint 53 should implement the actual `pg` adapter and wire the API runtime to repositories.
