# Staging Environment

Staging must be isolated from production data and secrets:

- separate Render API service;
- separate Supabase project or genuinely isolated non-production database;
- separate Cloudflare hostname/deployment;
- Stripe test mode only;
- email sandbox/allowlisted recipients;
- Sentry `staging` environment;
- distinct JWT/portal secrets.

Deploy the same immutable commit/artifact promoted to production. Run migrations, core tests, cross-tenant PostgreSQL tests, payment webhook matrix, email delivery, and smoke tests before promotion. Additional provider resources may incur cost: **OPTIONAL COST / OPERATOR DECISION REQUIRED**.
