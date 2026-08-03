---
title: "ServicePro Release Readiness"
subtitle: "1. Release Classification"
document_type: "Engineering"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# ServicePro Release Readiness

> **Engineering**
> 1. Release Classification

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

**Version:** 8.0.0-alpha.1
**Assessment Date:** July 2026
**Target:** Alpha → Beta promotion gate

---

## 1. Release Classification

**Current:** Alpha (internal testing, single operator)
**Target:** Beta (limited external customers, paid support)
**Future:** GA (general availability, SLA-backed)

---

## 2. Gate Criteria Matrix

| # | Criterion | Alpha (Current) | Beta (Target) | GA (Future) |
|---|-----------|:---:|:---:|:---:|
| 1 | Core features functional | ✅ | Required | Required |
| 2 | Paid hosting (no cold starts) | ❌ | Required | Required |
| 3 | Automated backups | ❌ | Required | Required |
| 4 | CI test gating | ❌ | Required | Required |
| 5 | Error monitoring | ❌ | Required | Required |
| 6 | Uptime monitoring + alerting | ❌ | Required | Required |
| 7 | Security audit (dependencies) | ❌ | Required | Required |
| 8 | TypeScript strict mode | ❌ | Recommended | Required |
| 9 | E2E test suite | ❌ | Required (5+) | Required (50+) |
| 10 | Load testing | ❌ | Recommended | Required |
| 11 | Incident response runbook | ⚠️ Exists | Required | Required |
| 12 | SLA definition | ❌ | Informational | Required |
| 13 | Data backup restoration verified | ❌ | Required | Required |
| 14 | Branch protection | ❌ | Required | Required |
| 15 | HTTPS everywhere | ✅ | Required | Required |
| 16 | RBAC enforcement | ✅ | Required | Required |
| 17 | Multi-tenant isolation verified | ⚠️ Assumed | Required (tested) | Required |
| 18 | API documentation | ⚠️ OpenAPI exists | Required (complete) | Required |
| 19 | User documentation | ✅ 11 guides | Required | Required |
| 20 | Payment processing | ❌ | Required | Required |
| 21 | Email notifications | ❌ | Required | Required |
| 22 | Customer portal functional | ⚠️ Partial | Required | Required |

**Current score:** 5/22 required for Beta = **Not ready for Beta promotion**

---

## 3. Blocking Issues for Beta

### 3.1 Infrastructure (Must Fix)

| Issue | Current State | Required State | Effort |
|-------|--------------|----------------|--------|
| Cold start latency | 50+ seconds | <2 seconds | Upgrade Render plan |
| Database may pause | 7-day inactivity rule | Always available | Upgrade Supabase |
| No backup restoration | Trust Supabase | Verified restore procedure | 4 hours |
| No uptime monitoring | Manual checking | Automated alerting | 2 hours |

### 3.2 Quality (Must Fix)

| Issue | Current State | Required State | Effort |
|-------|--------------|----------------|--------|
| Tests don't run in CI | 770 tests exist, untested | Green CI with coverage report | 4 hours |
| No type checking in CI | TypeScript errors possible | `tsc --noEmit` in CI | 2 hours |
| No error tracking | Errors invisible | Sentry or equivalent | 4 hours |
| No E2E tests | Manual verification only | 5+ critical path E2E tests | 8 hours |

### 3.3 Security (Must Fix)

| Issue | Current State | Required State | Effort |
|-------|--------------|----------------|--------|
| Dependency vulnerabilities | 3 high severity (web) | Zero high severity | 2 hours |
| No npm audit in CI | Unknown vulnerability state | Automated scanning | 1 hour |
| Static JWT secret | Generated once, never rotated | Rotation mechanism | 8 hours |
| No branch protection | Direct push to main | Required PR + review | 30 min |

### 3.4 Feature (Must Fix for Beta)

| Issue | Current State | Required State | Effort |
|-------|--------------|----------------|--------|
| No payment processing | Invoices without payment | Stripe integration | 20 hours |
| No email notifications | No transactional email | SendGrid/Resend for key events | 12 hours |
| Customer portal incomplete | Login + basic views | Full self-service | 20 hours |

---

## 4. Verification Procedures

### 4.1 Pre-Release Checklist

```
□ All CI checks passing (build, type check, tests, security scan)
□ E2E smoke tests pass against staging
□ Database backup taken and restoration verified
□ No high/critical npm audit findings
□ Error monitoring confirmed receiving events
□ Uptime monitor confirmed alerting
□ CORS configuration reviewed (production origins only)
□ JWT secret is environment-specific (not shared across envs)
□ Rate limiting tested under load
□ Multi-tenant isolation manually verified (cross-tenant data leak test)
□ OpenAPI spec matches actual endpoint behavior
□ Customer-facing documentation reviewed for accuracy
□ Rollback procedure documented and tested
```

### 4.2 Smoke Test Suite (Minimum for Beta)

| Test | Endpoint | Expected |
|------|----------|----------|
| Health check | `GET /healthz` | `{"status":"ok"}` |
| Readiness | `GET /readyz` | 200 with DB connectivity |
| Auth login | `POST /auth/login` | JWT returned |
| Auth refresh | `POST /auth/refresh` | New JWT |
| Create customer | `POST /api/v1/customers` | 201 with customer ID |
| List jobs | `GET /api/v1/jobs` | 200 with array |
| Public storefront | `GET /api/public/storefront/aquapro` | 200 with tenant profile |
| CORS preflight | `OPTIONS /api/v1/customers` | Correct headers |
| Rate limit | 100 requests in 1 second | 429 after threshold |
| Invalid auth | `GET /api/v1/customers` (no token) | 401 |

### 4.3 Tenant Isolation Verification

```
1. Authenticate as tenant_demo user
2. Attempt to access cd_tenant_demo customer data
3. Verify 403 or empty result (no cross-tenant leakage)
4. Repeat in reverse direction
5. Verify platform admin CAN access both (intended)
```

### 4.4 Database Recovery Test

```
1. Record current tenant count and recent customer
2. Trigger Supabase backup (or PITR snapshot)
3. Create new test data (customer, job)
4. Restore backup to fresh project
5. Verify pre-backup data intact, post-backup data absent
6. Document RTO (recovery time objective) achieved
```

---

## 5. Release Process

### 5.1 Current Process (Alpha)

```
Developer → Push to main → Render auto-deploy → Live
```

**Problems:** No review gate, no staging, no verification step.

### 5.2 Target Process (Beta)

```
Developer → Feature branch → PR (CI must pass) → Review → Merge to main
  → Render staging deploy → Smoke tests (automated) → Manual approval
  → Production deploy → Post-deploy verification
```

### 5.3 Rollback Procedure

| Step | Action | Time |
|------|--------|------|
| 1 | Identify issue (Sentry alert or uptime monitor) | 0–5 min |
| 2 | Render dashboard → Manual Deploy → select previous commit | 2 min |
| 3 | Verify rollback successful (health check green) | 1 min |
| 4 | If database migration was involved, run reverse migration | 5–15 min |
| 5 | Post-incident review | 1 hour |

**Total expected rollback time:** 3–8 minutes (no migration), 10–20 minutes (with migration)

---

## 6. Environment Matrix

| Environment | Purpose | URL | Status |
|-------------|---------|-----|--------|
| Production API | Live traffic | api.aardvark-enterprises.net | Active |
| Production Web | Live frontend | app.aardvark-enterprises.net | Active |
| Staging | Pre-production verification | — | Not configured |
| Local | Developer machine | localhost:3000 / localhost:3001 | Available |

**Recommendation:** Configure staging on Render (same free tier or minimal paid) with separate Supabase project.

---

## 7. Monitoring & Alerting Plan

### 7.1 Uptime Monitoring

| Monitor | URL | Check Interval | Alert Channel |
|---------|-----|----------------|---------------|
| API Health | `GET /healthz` | 5 min | Email + SMS |
| API Readiness | `GET /readyz` | 5 min | Email |
| Web Home | `GET /` | 5 min | Email |
| Storefront | `GET /api/public/storefront/aquapro` | 15 min | Email |

### 7.2 Error Alerting

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Unhandled exception | Any occurrence | Sentry notification |
| Error rate spike | >10 errors/minute | Email alert |
| Response time P95 | >5 seconds | Warning |
| Response time P95 | >15 seconds | Critical alert |
| Database connection failure | Any | Critical alert + page |

### 7.3 Business Metrics (Post-Beta)

| Metric | Source | Dashboard |
|--------|--------|-----------|
| Active tenants | Database query | Admin UI |
| Jobs created/day | Audit log | Dashboard |
| Service requests/day | Public storefront | Dashboard |
| API requests/day | Request metrics middleware | Render metrics |

---

## 8. Beta Launch Checklist

### Week -2 (Preparation)

- [ ] Upgrade Render to Starter plan
- [ ] Upgrade Supabase to Pro plan
- [ ] Configure Sentry project
- [ ] Set up UptimeRobot monitors
- [ ] Enable branch protection on main
- [ ] Run and fix `npm audit`
- [ ] Add TypeScript check to CI

### Week -1 (Verification)

- [ ] Run full test suite, document pass rate
- [ ] Execute E2E smoke tests
- [ ] Perform tenant isolation verification
- [ ] Verify database backup + restore
- [ ] Review CORS and security headers
- [ ] Test rollback procedure
- [ ] Update user documentation

### Launch Day

- [ ] Final smoke test pass
- [ ] Confirm all monitors green
- [ ] Verify error tracking receiving events
- [ ] Tag release `v8.0.0-beta.1`
- [ ] Communicate launch to early customers
- [ ] Monitor first 24 hours closely

### Week +1 (Stabilization)

- [ ] Review error reports from first week
- [ ] Address any P0/P1 issues discovered
- [ ] Collect early customer feedback
- [ ] Adjust rate limits if needed
- [ ] Verify billing/payments working (if enabled)

---

## 9. Known Risks at Launch

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| Supabase quota exceeded | Service degradation | Monitor usage, upgrade plan | Ops |
| Render instance memory pressure | OOM restart | Monitor, optimize imports | Dev |
| Phase stub modules slow startup | 3–5s added cold start | Lazy-load or remove | Dev |
| Large component re-renders | UI lag on slow devices | Component splitting | Frontend |
| Single operator dependency | Bus factor = 1 | Document all procedures | All |

---

## 10. Post-Beta Roadmap Gates

### Beta → GA Requirements (All must pass)

1. 30+ days uptime >99.5%
2. Zero data loss incidents
3. 10+ active paying tenants
4. Load test: 100 concurrent users, P95 <2s
5. Security penetration test (third-party or automated)
6. SOC 2 Type I readiness assessment
7. 50+ E2E tests passing
8. Full API documentation coverage
9. Customer support process defined
10. SLA published (99.9% uptime target)
