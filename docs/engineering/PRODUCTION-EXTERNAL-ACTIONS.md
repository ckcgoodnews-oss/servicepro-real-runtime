# ServicePro Production External Actions

Do not place secret values in this document, tickets, screenshots, or Git history.

## GitHub

- [ ] In **Repository → Settings → Rules → Rulesets** (or Branches), protect `main`; require pull requests, conversation resolution, current branches, and the actual CI check named **Node runtime tests**. Disable force-push and deletion. Verification: an unreviewed/failing change cannot merge. Non-secret.

## Render

- [ ] In **Dashboard → production API service → Settings**, confirm a persistent paid instance. The committed alpha blueprint is `free` and is not production evidence. Verification: service plan metadata and no idle spin-down. Non-secret.
- [ ] Set `NODE_ENV=production`, `DATA_STORE=postgres`, `DATABASE_URL`, `DATABASE_SSL`, `JWT_SECRET`, `PORTAL_TOKEN_SECRET`, `CORS_ALLOWED_ORIGINS`, and `APP_VERSION` under **Environment**. `DATABASE_URL`, JWT, and portal secrets are secret. Verification: `/readyz`, logs, login, and database smoke.
- [ ] Set `CORS_ALLOWED_ORIGINS=https://www.aardvark-enterprises.net,https://aardvark-enterprises.net`. Verification: accepted-origin preflight has the exact ACAO value; an arbitrary origin does not.

## Supabase

- [ ] In **Organization/project billing and Settings → Infrastructure**, confirm the intended paid production project, region, Postgres version, and backup/PITR capabilities. Verification: provider metadata. Non-secret evidence; do not capture credentials.
- [ ] In **Connect**, select and record the correct session/direct pooler URI for the persistent Node API; store it only as Render `DATABASE_URL`. Verification: sustained PostgreSQL smoke and pool metrics. Secret.
- [ ] In **Database → Backups**, perform an isolated restoration drill and record recovery start/end, RPO, RTO, and integrity checks. Never restore over production. Verification: application smoke against restored target.
- [ ] Inspect RLS policies and run cross-tenant tests using the same database role as production. Verification: attempts to read/write another tenant fail.

## Cloudflare

- [ ] In **Workers & Pages → servicepro-web → Settings/Domains**, confirm `www.aardvark-enterprises.net` serves the checked deployment over HTTPS. Verification: deployment SHA and HTTP response.
- [ ] In **DNS**, point the canonical `www` hostname to the actual Worker/custom domain and create a permanent HTTPS redirect from the apex. Use provider-generated targets only. Verification: `www` returns 200; apex returns 301/308 to `www`.
- [ ] Configure production security headers at the Worker/static-asset layer after testing the actual application resource allowlist. Verification: browser smoke plus HTTP header scan.

## Resend / email provider decision

- [ ] Decide whether to migrate the existing SendGrid abstraction to Resend. Current code is SendGrid-based; do not configure both accidentally.
- [ ] If Resend is selected: **Resend → Domains → Add domain**, add `aardvark-enterprises.net`, then copy the exact provider-generated DKIM/SPF records into Cloudflare DNS. Never invent values. Verification: Resend shows verified.
- [ ] Ensure there is only one SPF TXT policy; merge authorized senders rather than adding a second `v=spf1` record. Add a conservative DMARC policy and a real monitored reporting address. Verification: DNS lookup and delivered-message authentication results.
- [ ] Create a restricted API key, store it only in Render, and set `EMAIL_FROM=ServicePro <noreply@aardvark-enterprises.net>` after verification. Both API key and provider tokens are secret. Verification: delivered verification/reset email and provider event.

## Stripe

- [ ] Keep production payment entry disabled until the repository payment gate passes.
- [ ] In **Developers → Webhooks**, create the production endpoint only after durable reconciliation is implemented; copy the signing secret to Render `STRIPE_WEBHOOK_SECRET`. Secret. Verification: signed test event, duplicate delivery, and retry all reconcile once.
- [ ] Store the live restricted secret key in Render as `STRIPE_SECRET_KEY`; never expose it through `NEXT_PUBLIC_*`. Secret. Verification: server-side configuration check without printing the value.
- [ ] Run test-mode success, decline, authentication-required, duplicate webhook, retry, refund, and reconciliation cases before live mode. Verification: Stripe events match ServicePro ledger/invoice state.

## Sentry

- [ ] Create separate API/web projects and production/staging environments. Store server DSN/config in Render and only approved public client configuration in the frontend. Verification: intentional test errors appear with release SHA and environment, without secrets/PII.

## Monitoring

- [ ] Configure independent HTTPS checks for the canonical frontend, API `/healthz`, and API `/readyz`; route alerts to at least two maintained contacts. Verification: controlled test alert and recovery notification.
