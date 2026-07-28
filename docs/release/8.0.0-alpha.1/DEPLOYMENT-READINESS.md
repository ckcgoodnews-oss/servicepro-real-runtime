# ServicePro 8.0.0-alpha.1 — Deployment Readiness

## Verified configuration

- `render.yaml` targets `main`, provisions a non-production free Render PostgreSQL instance, and executes `npm run migrate` before deployment.
- Both web services explicitly use Render's free instance type and may spin down after inactivity.
- The free PostgreSQL instance is limited to 1 GB, has no backups, and expires after 30 days. It must not hold production or irreplaceable data.
- Production secrets and allowed origins are environment inputs rather than repository defaults.
- Production Docker Compose fails closed when database, Redis, signing secrets, or CORS values are absent.
- Development Compose values are explicitly development-only.
- Cloudflare Pages/Workers static assets use the current `assets.directory = "./out"` model.
- Application, package, and deployment versions agree on `8.0.0-alpha.1`.

## Non-production deployment checklist

1. For evaluation, provision the Blueprint's free PostgreSQL instance and record its 30-day expiration date. For production, replace it with managed PostgreSQL and Redis plans that include backup/retention policies.
2. Inject unique signing secrets, database credentials, Redis URL, canonical public API URL, and exact allowed origins.
3. Run the pre-deploy migration and retain its immutable log.
4. Verify `/healthz`, `/readyz`, login, dashboard, customer, work-order, invoice, and payment workflows.
5. Verify tenant isolation with two controlled tenants.
6. Perform and restore a deployment-environment backup.
7. Validate TLS, DNS, Cloudflare headers/caching rules, logging, alerting, and rollback.
8. Promote only the tested artifact digest; do not rebuild between environments.

## Rollback gate

Before production promotion, record the previous artifact digest, database backup identifier, migration boundary, rollback owner, and maximum acceptable recovery time. A rollback is not considered ready until the restored application passes authenticated smoke testing.
