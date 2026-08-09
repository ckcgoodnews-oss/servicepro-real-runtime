# Render Production API

The root `render.yaml` is currently an **alpha/free blueprint**, not production configuration. It declares free web services and an expiring free PostgreSQL database. Do not use that database for paying customers.

## Intended API service

- Runtime: Node.js 20 or a tested newer LTS matching `package.json`.
- Build: `npm ci --omit=dev`.
- Start: `npm run migrate && npm start` until a safer pre-deploy migration mechanism is selected for the paid service.
- Health check: `/readyz`.
- Deploy trigger: GitHub checks passing (`autoDeployTrigger: checksPass` is present in the blueprint).
- Database: production Supabase connection chosen per the database architecture review, not the blueprint database.

Use the environment contract in `ENVIRONMENT-VARIABLES.md`. Secrets belong only in Render Environment settings.

## Verification

1. Confirm the paid/non-sleeping plan in service metadata.
2. Deploy the checked commit and record Render deploy ID/SHA.
3. Confirm `/healthz` identifies the expected version.
4. Confirm `/readyz` is healthy and database-connected.
5. Run `node scripts/smoke-deployed-app.js` with the canonical web/API URLs.
6. Inspect logs for migration, pool, authentication, and 5xx errors without exposing secrets.

## Rollback

Select the last known-good deploy in **Render → Service → Deploys → Rollback**, then verify health/readiness and critical smoke tests. Database compatibility must be assessed before rolling application code behind an irreversible migration.
