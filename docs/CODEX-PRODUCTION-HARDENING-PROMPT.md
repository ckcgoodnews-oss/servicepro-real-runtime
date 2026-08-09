# Codex Prompt — Make ServicePro Bulletproof and Production-Ready

You are the senior platform reliability engineer and security architect for ServicePro.

## Repository

```
Y:\ServiceRepo (or I:\REPO\ServicePRO or D:\ServiceRepo — same repo, different machines)
```

Remote: `https://github.com/ckcgoodnews-oss/servicepro-real-runtime.git`
Branch: `main`

Always pull before starting:
```bash
git pull origin main
```

## Current State

- **API:** Node.js raw HTTP server at `apps/api/src/server.js` deployed on Render (Starter plan)
- **Web:** Next.js 15 static export on Cloudflare Workers at `www.aardvark-enterprises.net`
- **DB:** PostgreSQL 16 on Supabase Pro (ca-central-1)
- **Auth:** JWT + bcryptjs with refresh tokens and MFA support
- **Tenants:** `tenant_demo` (Aqua Pro Plumbing), `cd_tenant_demo` (C & D Landscaping)
- **Platform admin:** `5189213@gmail.com`
- **Tests:** 770+ test files exist but do NOT run in CI
- **TypeScript:** Compiles clean (`tsc --noEmit` passes)
- **Trial system:** Fully built (registration, marketplace selection, site generation)
- **50 marketplace industry packs** active

## Objective

Transform ServicePro from a working alpha into a production-hardened platform that can safely accept paying customers. No feature additions — only reliability, security, observability, and quality infrastructure.

## Phase 1: CI/CD Pipeline (Critical)

### 1.1 GitHub Actions CI

Create or update `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: node -e "require('./apps/api/src/router')"  # Smoke load
      - run: npm test  # Run existing test suite

  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd apps/web && npm ci
      - run: cd apps/web && npx tsc --noEmit
      - run: cd apps/web && npm run build
```

### 1.2 Enforce in branch protection

After CI passes, configure GitHub branch protection for `main`:
- Require status checks: `api`, `web`
- Require PR before merge
- Require 1 approval (can be self-approve for solo dev)

## Phase 2: Error Monitoring

### 2.1 Sentry Integration

Install:
```bash
npm install @sentry/node --save
```

Add to `apps/api/src/server.js` (at the top):
```javascript
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'development' });
}
```

Add global error handler to catch unhandled exceptions:
```javascript
process.on('uncaughtException', (err) => {
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
  console.error('Uncaught:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  if (process.env.SENTRY_DSN) Sentry.captureException(err);
  console.error('Unhandled rejection:', err);
});
```

Add `SENTRY_DSN` to Render environment variables.

### 2.2 Structured Logging

Replace console.log/error with structured JSON logging throughout `apps/api/src/`:
- Every log entry must include: `timestamp`, `level`, `message`, `requestId`, `tenantId`
- Never log: passwords, tokens, full request bodies, PII beyond email
- Log: request duration, status codes, auth failures, rate limit hits, migration results

## Phase 3: Security Hardening

### 3.1 Dependency Audit

Add to CI:
```yaml
- run: npm audit --audit-level=high
```

Fix all high/critical vulnerabilities. Pin exact versions in `package-lock.json`.

### 3.2 Rate Limiting Improvements

- Add per-tenant rate limiting (not just global IP-based)
- Add stricter limits on auth endpoints (login: 5/min, register: 3/min, password reset: 3/hour)
- Add rate limit headers to all responses

### 3.3 Input Validation

Audit every route handler in `apps/api/src/routes/`:
- Ensure all user inputs are validated before use
- Use parameterized queries everywhere (audit for string interpolation in SQL)
- Validate content-type headers
- Reject oversized payloads (already have bodyLimit middleware — verify coverage)

### 3.4 CORS Audit

Verify `apps/api/src/middleware/cors.js`:
- Only allows configured origins
- No wildcard `*` in production
- Credentials mode is correct

### 3.5 Secret Rotation

- Document procedure to rotate JWT_SECRET without invalidating all sessions
- Document procedure to rotate PORTAL_TOKEN_SECRET
- Add `JWT_SECRET_PREVIOUS` support for graceful rotation

## Phase 4: Database Reliability

### 4.1 Connection Pooling

- Verify Supabase connection pooling is configured (use port 6543 for transaction mode)
- Add connection retry logic with exponential backoff
- Add connection health check before query execution

### 4.2 Migration Safety

- Add migration dry-run command: `npm run migrate:dry`
- Add migration rollback documentation for each migration in `migrations/postgres/`
- Verify all migrations are idempotent (IF NOT EXISTS, ON CONFLICT)
- Add migration lock to prevent concurrent migration runs

### 4.3 Backup Verification

- Create a script that verifies Supabase backup: `scripts/verify-backup.js`
- Test restoration to a temporary project
- Document RTO/RPO (Recovery Time/Point Objective)

## Phase 5: Observability

### 5.1 Health Checks

Enhance `/readyz` to check:
- Database connectivity (query `SELECT 1`)
- Response time (fail if >5s)
- Memory usage (warn if >80%)
- Return structured JSON with component status

### 5.2 Request Metrics

Add metrics endpoint (`/metrics` or log-based):
- Request count by route, method, status
- P50/P95/P99 latency by route
- Error rate
- Active connections
- Database query duration

### 5.3 Alerting

Configure UptimeRobot (free) or Better Uptime:
- Monitor `/readyz` every 2 minutes
- Alert on: downtime, slow response (>5s), error spike
- Alert channels: email + SMS

## Phase 6: Test Infrastructure

### 6.1 Make Existing Tests Run

- Audit the 770 test files in `tests/`
- Determine which pass, which fail, which are stubs
- Create `npm run test:core` that runs the critical subset
- Add to CI

### 6.2 Critical Path Tests

Write integration tests for:
- Login → get token → access protected route
- Register trial → verify → select marketplace → get site
- Create customer → create job → create invoice → record payment
- Public storefront load (non-authenticated)
- Rate limiting enforcement
- Cross-tenant isolation (tenant A can't see tenant B data)

### 6.3 Authorization Matrix Tests

For each role (owner, admin, technician, trial):
- Test access to every protected route
- Verify denial returns 403 (not 404 or 500)
- Verify cross-tenant requests are blocked

## Phase 7: Frontend Reliability

### 7.1 Error Boundaries

Add React error boundaries to every workspace component:
- Catch render errors gracefully
- Show "Something went wrong" with retry button
- Report to Sentry

### 7.2 Loading States

Audit all components that fetch data:
- Every fetch must show loading skeleton
- Every fetch must handle error state
- No blank screens on slow network

### 7.3 Offline Handling

- Detect when API is unreachable (Render cold start)
- Show "Connecting..." banner
- Auto-retry failed requests

## Phase 8: Deployment Safety

### 8.1 Render Configuration

- Verify auto-deploy only triggers after CI passes (`autoDeployTrigger: checksPass` in render.yaml)
- Add pre-deploy health check
- Configure auto-scaling rules (for future)

### 8.2 Rollback Procedure

Document in `docs/engineering/ROLLBACK.md`:
- How to rollback API (Render dashboard → previous deploy)
- How to rollback frontend (Cloudflare Workers → previous version)
- How to rollback database (reverse migration)
- Maximum acceptable rollback time: <5 minutes

### 8.3 Feature Flags

Add simple feature flag support:
- Environment variable based: `FEATURE_TRIAL_MARKETPLACE=true`
- Check in service layer before executing new feature code
- Allow disabling features without deployment

## Phase 9: Documentation

### 9.1 Runbook

Create `docs/engineering/PRODUCTION-RUNBOOK.md`:
- How to access logs (Render dashboard)
- How to restart the service
- How to check database connectivity
- How to respond to an outage
- How to respond to a security incident
- Emergency contact information
- Escalation path

### 9.2 Architecture Decision Records

Create `docs/engineering/ADR/` with decisions for:
- Why raw HTTP (no Express)
- Why Supabase
- Why Cloudflare Workers for frontend
- Why JWT (not session cookies)
- Why SQLite for contact collection (not Postgres)

## Acceptance Criteria

The platform is production-hardened when:

1. ✅ CI runs on every push and blocks broken code from main
2. ✅ TypeScript and lint checks pass in CI
3. ✅ At least 20 critical-path tests run in CI
4. ✅ All high/critical npm audit findings resolved
5. ✅ Sentry captures unhandled errors in production
6. ✅ `/readyz` checks database + responds in <1s
7. ✅ Uptime monitor alerts on downtime within 5 minutes
8. ✅ Cross-tenant isolation is tested and enforced
9. ✅ Auth rate limiting blocks brute force attempts
10. ✅ Rollback procedure is documented and tested
11. ✅ Production runbook exists and is current
12. ✅ All environment variables are documented
13. ✅ No secrets in git history
14. ✅ Branch protection enforced on main

## Rules

- Do NOT add new features
- Do NOT change existing API behavior
- Do NOT break existing functionality
- Do NOT modify database schema (unless adding indexes/constraints)
- Do NOT install heavy frameworks (no Express migration)
- Keep changes minimal and focused on reliability
- Every change must be tested before commit
- Commit in logical groups with clear messages

## Commit Conventions

```
fix(security): add per-tenant rate limiting
fix(ci): add TypeScript and test checks to GitHub Actions
feat(observability): add Sentry error tracking
feat(health): enhance readiness check with DB connectivity
docs(ops): add production runbook and rollback procedure
test(auth): add cross-tenant isolation tests
chore(deps): resolve high-severity npm audit findings
```
