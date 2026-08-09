# ServicePro Production Readiness Audit

Audit date: 2026-08-09

Source commit: `e4bd7f6139029bfab15c595a668a6f053b30e9f8`

Status vocabulary: VERIFIED, CONFIGURED IN REPOSITORY, IMPLEMENTED — NEEDS DEPLOYMENT, OPERATOR ACTION REQUIRED, BLOCKED, FAILED, NOT APPLICABLE.

Documentation and historical sprint tests are treated as supporting evidence, not proof of deployed provider state.

| Component | Current state and evidence | Production risk | Required action | Can Codex fix? | External action required? | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Source control | `origin` is the expected GitHub repository. Audit began on commit `e4bd7f61`; work isolated on `codex/production-hardening`. | Branch protection and required checks are not proven. | Verify GitHub ruleset and require the CI job. | Partly | Yes | GitHub rules API/settings | OPERATOR ACTION REQUIRED |
| CI | `.github/workflows/ci.yml` existed but used `npm install`, had no core suite or explicit typecheck/audit, and built against localhost. | Nondeterministic installs and incomplete gates. | Use `npm ci`, run core tests, typecheck, audits, migrations, and production builds. | Yes | No | GitHub Actions run | CONFIGURED IN REPOSITORY |
| Tests | 778 test files exist. `npm run test:core` passes 15 selected critical files. The full runner reports 774 passing files and 4 failures: `sprint52-repository`, `sprint728-expanded-service-catalog`, `sprint730-phase-completion`, and `sprint737-fresh-deployment-login`. | Repository factory compatibility, stale catalog expectation, incomplete release manifest, and startup-contract drift are unresolved. | Fix root causes or formally classify obsolete assertions; do not delete tests to make CI green. | Yes | No | Local and CI results | FAILED |
| API runtime | Raw Node HTTP server at `apps/api/src/server.js`; `/healthz` and `/readyz` are routed. | Deployed API health and DB readiness are not proven. | Deploy checked commit and verify both endpoints. | Partly | Yes | HTTPS responses plus Render logs | IMPLEMENTED — NEEDS DEPLOYMENT |
| Render | Root `render.yaml` explicitly declares free web services and a free, expiring PostgreSQL database. | Sleeping service, expiring DB, no backups; unsuitable for paying customers. | Replace/retire alpha blueprint with paid API service and production Supabase URL after operator decision. | Partly | Yes | Render service metadata | BLOCKED |
| Frontend | Next.js 15.5.20. Cloudflare configuration is a static Workers Assets deployment (`apps/web/wrangler.toml`, `out/`), not OpenNext. | Production domain, route, headers, and deployed API URL are not provider-verified. | Build static export with production API URL, deploy, verify custom domains and headers. | Partly | Yes | Wrangler deployment and HTTP checks | OPERATOR ACTION REQUIRED |
| Database | `pg` pool uses `DATABASE_URL`; SSL currently sets `rejectUnauthorized:false`; migration ordering passes for 686 files. Numerous PostgreSQL repository methods explicitly return placeholder IDs/empty results. | TLS identity is not verified; pool lacks explicit bounds/timeouts; advertised features may not persist. | Define Supabase pooler architecture, harden pool, test real DB, replace or disable placeholder-backed features. | Partly | Yes | PostgreSQL smoke, tenant isolation, provider metadata | NOT YET PRODUCTION READY |
| Migrations | `npm run migrations:check` passes: 686 migrations, latest `781_tenant_registry_reconciliation.sql`. Check only validates numbering/order. | Destructive SQL, locking, transactions, and applied-state drift are not comprehensively checked. | Add SQL safety policy/checks and production dry-run against staging. | Yes | Yes for staging | Static scan plus staging migration | PARTIALLY VERIFIED |
| Authentication | Access/refresh sessions and one-time reset records exist; core auth tests pass. JWT verification has no current/previous secret rotation path. | Rotation requires session disruption; provider deployment secrets unverified. | Add bounded previous-secret verification and test rotation before deployment. | Yes | Yes | Auth tests and deployed login/refresh | PARTIALLY VERIFIED |
| Tenant isolation | Tenant resolver/repository patterns and selected isolation test pass. PostgreSQL/RLS behavior is not proven against production-like Supabase. | JSON-mode tests do not prove database policies or every raw query. | Run PostgreSQL cross-tenant suite and inspect RLS/service-role boundaries. | Partly | Yes | Staging database test | PARTIALLY VERIFIED |
| CORS | Exact-origin allowlist is implemented through `CORS_ALLOWED_ORIGINS`. | Production values are not proven. | Set both approved HTTPS origins and verify rejected origins receive no ACAO header. | Partly | Yes | HTTP preflight tests | IMPLEMENTED — NEEDS DEPLOYMENT |
| Payments | Direct Stripe REST calls exist. Client supplies `amountCents`; an authenticated confirm handler can mark payment/invoice paid without webhook proof; missing keys create simulated success objects; webhook has no reconciliation/idempotency. | Revenue and invoice integrity failure. | Disable production payments until server-controlled amount validation, signature tolerance, durable event idempotency, and reconciliation tests exist. | Yes | Yes | Stripe test-mode matrix | FAILED — PAYMENTS NOT PRODUCTION READY |
| Email | Notification service uses SendGrid, not Resend; missing configuration returns simulated success. Password reset creates a token but no verified delivery path was found. | Security/customer email can be silently undelivered. | Implement a fail-closed provider abstraction, wire required messages, then verify SPF/DKIM/DMARC and delivery. | Yes | Yes | Provider event plus received message | FAILED — EMAIL NOT PRODUCTION READY |
| Sentry | No Sentry SDK dependency or runtime integration found. | Request failures are not centrally correlated or alerted. | Add SDK or an approved error-monitoring integration and verify a production test event. | Partly | Yes | Sentry event ID | BLOCKED |
| Security headers | Next config disables `X-Powered-By`; no deployed CSP/HSTS/Permissions-Policy evidence found. | Browser hardening depends on unverified edge configuration. | Add static asset headers compatible with current frontend and validate on domain. | Partly | Yes | HTTP header scan | OPERATOR ACTION REQUIRED |
| Dependency security | Root production audit reported zero vulnerabilities, but the frontend audit reported four high-severity advisories affecting Next.js 15.5.20 and transitive packages. Two attempted patch installs timed out before changing the lockfile. | Known high-severity dependency findings block release. | Upgrade to the npm-audit identified patched Next.js line (15.5.23 or later compatible release), regenerate the lockfile, then rerun audit/typecheck/build. | Yes | Network/package registry | CI logs | FAILED |
| Backups/DR | Scripts and historical docs exist; Render blueprint database explicitly has no backups. No restoration evidence was produced. | Data loss and unknown RTO/RPO. | Use paid Supabase backup/PITR as selected, perform isolated restore drill, record evidence. | Partly | Yes | Restore drill | BLOCKED |
| Monitoring | Health/readiness endpoints and smoke scripts exist. External uptime checks and alert delivery are not proven. | Outages may go undetected. | Configure independent checks for frontend, `/healthz`, and `/readyz`. | Partly | Yes | Synthetic monitor history | OPERATOR ACTION REQUIRED |

## Highest-priority release blockers

1. Payment confirmation and webhook processing are not authoritative or idempotent.
2. Transactional email can report simulated success and required delivery flows are not proven.
3. Production PostgreSQL support includes explicit placeholder repository implementations.
4. The committed Render blueprint describes free, expiring infrastructure.
5. Supabase tier, pooler URL, backup/PITR, RLS, and restore behavior lack provider/database evidence.
6. Sentry and independent uptime alerts lack evidence.

## Verified local baseline

- `npm run migrations:check`: passed, 686 migrations.
- `npm --prefix apps/web run typecheck`: passed.
- Root `npm audit --audit-level=high --omit=dev`: zero vulnerabilities.
- Web production audit: failed with four high-severity findings; remediation download was blocked by repeated registry timeouts.
- Root production build: failed during frontend typecheck after the blocked dependency remediation left the generated local `apps/web/node_modules` tree incomplete. Source manifests/lockfiles were unchanged; a clean `npm ci --prefix apps/web` remains required when registry/filesystem I/O is healthy.
- `npm run test:core`: 15 selected test files passed.
- `npm test`: 774 of 778 files passed; four failed (see Tests row).

## Verdict

**NOT YET PRODUCTION READY.** The repository has meaningful security and release foundations, but payment, email, database persistence coverage, paid infrastructure, recovery, observability, and deployed-provider gates remain incomplete or unverified.
