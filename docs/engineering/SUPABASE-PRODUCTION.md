# Supabase Production Database

Provider tier, region, version, backups, and connection endpoint are **OPERATOR ACTION REQUIRED** until verified from Supabase.

The API is a persistent Node process with a `pg` pool. Prefer a session pooler or direct connection when IPv4/networking allows it. Do not choose transaction pooling blindly: verify prepared statements, transaction-scoped RLS context, and migration behavior first. Migrations should use a direct/session connection, not a transaction pooler that changes transaction semantics.

Repository safeguards include bounded pool size, connection/idle/statement/query timeouts, TLS certificate verification by default, and explicit transactions around tenant-scoped `SET LOCAL` queries.

## Required verification

1. Use a staging project or isolated non-production database.
2. Apply all migrations and record schema/version.
3. Run PostgreSQL smoke and cross-tenant tests with the production role.
4. Confirm pool headroom for the Render instance count.
5. Simulate connection loss and confirm `/readyz` fails promptly without retry storms.
6. Confirm service-role/database credentials never appear in `NEXT_PUBLIC_*` or built assets.
7. Perform an isolated restore drill and record RPO/RTO.
