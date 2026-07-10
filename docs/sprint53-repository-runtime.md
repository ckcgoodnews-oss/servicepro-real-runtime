# Sprint 53 - Repository-Backed Runtime Routes

This patch is intended to apply over Sprint 52.

## Changed

- API routes now use `req.context.repositories`.
- `requestContext` attaches singleton repositories per runtime.
- Customer and job routes no longer import direct services.
- Repository factory now supports singleton runtime reuse.
- JSON mode remains the default.
- PostgreSQL mode remains a contract until the next runtime sprint.

## Next Sprint

Sprint 54 should implement the real PostgreSQL adapter using the `pg` package and make `DATA_STORE=postgres` executable.
