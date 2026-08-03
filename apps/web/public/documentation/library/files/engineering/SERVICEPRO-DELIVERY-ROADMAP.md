---
title: "ServicePro Delivery Roadmap"
subtitle: "1. Current State"
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

# ServicePro Delivery Roadmap

> **Engineering**
> 1. Current State

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
**Date:** July 2026
**Planning Horizon:** 6 months

---

## 1. Current State

ServicePro is a functional alpha with strong feature coverage for field service operations. The platform serves real tenants (Aqua Pro Plumbing, C & D Landscaping) but runs on free-tier infrastructure without production hardening. The gap between "working code" and "production-grade platform" is the focus of this roadmap.

---

## 2. Workstream Overview

| # | Workstream | Priority | Timeline | Objective |
|---|-----------|----------|----------|-----------|
| 1 | Production Hardening | Critical | Weeks 1–4 | Eliminate service reliability risks |
| 2 | Developer Experience | High | Weeks 2–6 | CI/CD, testing, type safety |
| 3 | Frontend Modernization | High | Weeks 4–10 | Performance, maintainability, UX |
| 4 | API Architecture | Medium | Weeks 6–14 | Framework adoption, router refactor |
| 5 | Data Platform | Medium | Weeks 8–16 | Backups, monitoring, connection pooling |
| 6 | Observability | Medium | Weeks 10–18 | Error tracking, metrics, alerting |
| 7 | Security Hardening | High | Weeks 4–12 | Scanning, rotation, penetration testing |
| 8 | Feature Completion | Ongoing | Weeks 1–24 | Customer portal, mobile, admin UI |

---

## 3. Workstream Details

### 3.1 Production Hardening (Weeks 1–4)

**Goal:** Make the platform reliable enough for paying customers.

| Task | Effort | Impact |
|------|--------|--------|
| Upgrade Render API to Starter plan ($7/mo) | 1 hour | Eliminates 50s cold starts |
| Upgrade Supabase to Pro ($25/mo) | 1 hour | Daily backups, no pause, 8 GB |
| Add health check alerting (UptimeRobot or similar) | 2 hours | Know when service is down |
| Configure proper CORS for production domain only | 1 hour | Tighten security surface |
| Add `package-lock.json` to root and enforce `npm ci` | 1 hour | Reproducible builds |
| Move JWT_SECRET to environment variable (not generate) | 1 hour | Survives redeploy |
| Document recovery procedure for DB restoration | 4 hours | Runbook for incidents |

**Exit Criteria:** API responds in <2s on first request, database has daily backups, alerting notifies on downtime.

---

### 3.2 Developer Experience (Weeks 2–6)

**Goal:** Prevent regressions, enforce quality, enable safe collaboration.

| Task | Effort | Impact |
|------|--------|--------|
| Add TypeScript `--noEmit` check to CI | 2 hours | Catch type errors before deploy |
| Run test suite in CI (even if some fail, report) | 4 hours | Visibility into test health |
| Add ESLint with recommended rules | 4 hours | Code consistency |
| Enable branch protection on main | 30 min | Require PR for changes |
| Add PR template with checklist | 1 hour | Structured review |
| Set up Playwright for E2E smoke tests | 8 hours | Critical path verification |
| Create `.env.local.example` for onboarding | 1 hour | New developer setup |
| Document local development setup in README | 2 hours | Reduce onboarding friction |

**Exit Criteria:** CI blocks PRs with type errors, at least 5 E2E tests covering login/jobs/storefront, branch protection enabled.

---

### 3.3 Frontend Modernization (Weeks 4–10)

**Goal:** Improve performance, reduce component complexity, establish design system.

| Task | Effort | Impact |
|------|--------|--------|
| Break StorefrontBuilder into 5–8 sub-components | 12 hours | Maintainability |
| Break PublicStorefront into section components | 8 hours | Testability |
| Extract shared UI primitives (Button, Input, Modal, Card) | 16 hours | Consistency |
| Remove CSS `!important` overrides — use proper specificity | 8 hours | Predictable styling |
| Add component-level Storybook or similar catalog | 8 hours | Visual regression |
| Implement proper loading/error states for all data fetches | 8 hours | UX polish |
| Add skeleton screens for slow API responses | 4 hours | Perceived performance |
| Audit accessibility (WCAG 2.1 AA) for core flows | 8 hours | Compliance |

**Exit Criteria:** No component exceeds 400 lines, shared UI library covers 80% of patterns, no `!important` in stylesheets.

---

### 3.4 API Architecture (Weeks 6–14)

**Goal:** Replace fragile raw HTTP routing with maintainable framework.

| Task | Effort | Impact |
|------|--------|--------|
| Evaluate Express vs. Fastify (recommend Fastify for perf) | 4 hours | Informed decision |
| Extract route groups from router.js into modular files | 16 hours | Maintainability |
| Adopt chosen framework incrementally (adapter pattern) | 24 hours | Modern middleware |
| Remove or lazy-load Phase 9–45 stub modules | 8 hours | Faster startup |
| Standardize error response format across all routes | 8 hours | API consistency |
| Generate OpenAPI spec from route definitions | 8 hours | Documentation |
| Add request/response validation (Zod or Joi) | 16 hours | Input safety |

**Exit Criteria:** Router.js under 200 lines, all routes registered via framework router, startup time under 3 seconds.

---

### 3.5 Data Platform (Weeks 8–16)

**Goal:** Production-grade database operations.

| Task | Effort | Impact |
|------|--------|--------|
| Implement connection pooling (Supabase Vibes or PgBouncer) | 4 hours | Connection efficiency |
| Add slow query logging (pg_stat_statements) | 4 hours | Performance visibility |
| Set up automated backup verification (restore to temp) | 8 hours | Backup confidence |
| Add database migration CI check (dry-run) | 4 hours | Prevent broken migrations |
| Implement proper migration versioning (sequential numbered) | 8 hours | Schema history |
| Add tenant data isolation tests | 8 hours | Security verification |
| Plan upgrade path from free tier when needed | 2 hours | Capacity planning |

**Exit Criteria:** Connection pooling active, slow queries logged, backup restore verified monthly.

---

### 3.6 Observability (Weeks 10–18)

**Goal:** See what's happening in production without SSH access.

| Task | Effort | Impact |
|------|--------|--------|
| Add Sentry for error tracking (free tier: 5K events/mo) | 4 hours | Error visibility |
| Add structured JSON logging | 8 hours | Log searchability |
| Implement request duration tracking | 4 hours | Performance baseline |
| Add database query timing | 4 hours | Bottleneck detection |
| Set up Render metrics dashboard | 2 hours | Resource monitoring |
| Add custom health metrics (tenant count, job volume) | 4 hours | Business metrics |
| Configure alerting thresholds | 4 hours | Proactive notification |

**Exit Criteria:** All unhandled errors captured, P95 latency visible, alerts for error spike and downtime.

---

### 3.7 Security Hardening (Weeks 4–12)

**Goal:** Close security gaps before acquiring more customers.

| Task | Effort | Impact |
|------|--------|--------|
| Add `npm audit` to CI with failure on high severity | 2 hours | Dependency safety |
| Implement JWT secret rotation mechanism | 8 hours | Secret hygiene |
| Add CSRF protection for state-changing endpoints | 8 hours | Request forgery prevention |
| Implement rate limiting per tenant (not just global) | 4 hours | Abuse prevention |
| Add input sanitization audit for all user inputs | 8 hours | Injection prevention |
| Enable Supabase Row Level Security for shared tables | 12 hours | Defense in depth |
| Schedule quarterly dependency update review | 2 hours | Maintenance cadence |
| Document security incident response procedure | 4 hours | Readiness |

**Exit Criteria:** Zero high-severity npm audit findings, per-tenant rate limiting active, RLS on shared tables.

---

### 3.8 Feature Completion (Ongoing)

**Goal:** Complete customer-facing features that drive revenue.

| Feature | Effort | Priority |
|---------|--------|----------|
| Customer Portal — full self-service (booking, payments, history) | 40 hours | High |
| Admin UI — complete platform management interface | 24 hours | High |
| Mobile responsive improvements (remaining pages) | 16 hours | Medium |
| Email notifications (transactional via SendGrid/Resend) | 12 hours | High |
| Payment processing integration (Stripe) | 20 hours | High |
| SMS notifications (Twilio) | 8 hours | Medium |
| Reporting export to PDF/Excel | 8 hours | Medium |
| Multi-user support per workspace | 12 hours | Medium |

---

## 4. Resource Requirements

### 4.1 Infrastructure Costs (Monthly)

| Service | Current | Recommended | Cost |
|---------|---------|-------------|------|
| Render API | Free | Starter | $7/mo |
| Render DB | Free | — (use Supabase) | $0 |
| Supabase | Free | Pro | $25/mo |
| Cloudflare Workers | Free | Free | $0 |
| Sentry | — | Free tier | $0 |
| UptimeRobot | — | Free tier | $0 |
| **Total** | **$0** | — | **$32/mo** |

### 4.2 Scaling Thresholds

| Trigger | Action | Cost Impact |
|---------|--------|-------------|
| >5 tenants active | Upgrade Render to Standard ($25/mo) | +$18/mo |
| >50 concurrent users | Add Redis caching | +$15/mo |
| >1 GB database | Supabase already Pro | Included |
| >100 tenants | Evaluate multi-instance API | +$50/mo |

---

## 5. Milestone Schedule

| Milestone | Target | Key Deliverables |
|-----------|--------|-----------------|
| M1: Stable Production | Week 4 | Paid hosting, backups, alerting, no cold starts |
| M2: CI/CD Complete | Week 6 | Tests in CI, branch protection, type checking |
| M3: Security Baseline | Week 12 | Audit clean, RLS, rate limiting, rotation |
| M4: Framework Migration | Week 14 | Fastify/Express adopted, router refactored |
| M5: Frontend V2 | Week 10 | Component library, no overrides, accessible |
| M6: Observability | Week 18 | Full error tracking, metrics, alerting |
| M7: Feature Complete | Week 24 | Customer portal, payments, email, mobile |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Free tier service outage during customer demo | High | High | Upgrade to paid plans (M1) |
| Database pause loses customer data | Medium | Critical | Supabase Pro + backup verification |
| Regression deployed to production | High | Medium | CI test gating (M2) |
| Security breach via unvalidated input | Medium | Critical | Input validation audit (M3) |
| Developer confusion from 14K file count | High | Low | Documentation, .gitignore cleanup |
| Router.js becomes unmaintainable | High | Medium | Framework migration (M4) |
| Customer-visible errors with no alerting | High | Medium | Sentry integration (M6) |

---

## 7. Decision Log

| Decision | Rationale | Date |
|----------|-----------|------|
| Stay on Supabase (not Render DB) | Better free tier, familiar, pooling built-in | July 2026 |
| Static export for frontend | Cloudflare Workers = fast, free, global CDN | July 2026 |
| No Express/Fastify yet | Working system, refactor after stabilization | July 2026 |
| Phase 9–45 remain scaffolded | Future roadmap, don't delete, but lazy-load | July 2026 |
| Monorepo stays (no microservices yet) | Single deploy target, simple, 2 tenants | July 2026 |
