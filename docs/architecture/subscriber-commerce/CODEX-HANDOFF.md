# CODEX HANDOFF — Subscriber Commerce Implementation

## Metadata

| Field | Value |
|-------|-------|
| Specification version | 1.0.0 |
| Date | 2026-08-11 |
| Source branch | `codex/production-hardening` |
| Starting SHA | `4285b7be99471d73a7cebc32ba159b515f270201` |
| Specification commit SHA | `e3664d5ecc5febc71b28e70c0120c6193bd17483` |
| Machine 1 (Kiro) | `D:\ServiceRepo` |
| **Machine 2 (Codex)** | **`I:\REPO\ServicePRO`** |

## How to Retrieve This Specification

```powershell
Set-Location I:\REPO\ServicePRO
git fetch origin --prune
git switch codex/production-hardening
git pull --ff-only origin codex/production-hardening
```

Then read: `docs/architecture/subscriber-commerce/`

---

## Specification Documents

| File | Content |
|------|---------|
| `00-existing-architecture.md` | Repository discovery, existing component inventory, gaps |
| `01-requirements.md` | Core business requirements, financial domain separation |
| `02-financial-architecture.md` | Three-domain model, what to reuse |
| `03-stripe-connect.md` | Express model decision, lifecycle, webhook model |
| `04-subscriber-settings.md` | Five settings groups, dependency rules |
| `05-data-model.md` | Migration 782/783/784 schemas, ALTER TABLE specs |
| `06-api-contracts.md` | All API endpoints with auth/validation/response |
| `07-security-model.md` | Security criteria, threat mitigations, permissions |
| `08-ui-and-onboarding.md` | Navigation, onboarding sequence, test transaction |
| `09-express-service.md` | Express Service feature spec |
| `10-testing-acceptance.md` | Required tests, nonfunctional requirements |
| `11-implementation-plan.md` | P0/P1/P2/P3 task breakdown with dependencies |
| `12-user-documentation-requirements.md` | HOW TO guide requirements |

---

## P0 Tasks (FINANCIAL SAFETY — Implement First)

| ID | Task | Key Files |
|----|------|-----------|
| P0-1 | Domain separation infrastructure (tables + repos) | `migrations/postgres/782_*`, new repositories |
| P0-2 | Stripe Connect Express onboarding | `stripeConnectService.js`, `stripeConnect.js` route |
| P0-3 | Accept Customer Payments setting | Settings endpoints |
| P0-4 | Webhook architecture (platform + connect) | `webhooks.js` route, router.js |
| P0-5 | Payment Intent on connected account | `customerPaymentService.js` |
| P0-6 | Atomic webhook reconciliation | Transaction in webhooks.js |
| P0-7 | Refund safety | Enhanced refund in payments.js |
| P0-8 | Permission integration | Route files + permissions.js |

## P1 Tasks (CORE COMMERCE)

| ID | Task |
|----|------|
| P1-1 | Customer Payments Settings UI (TSX) |
| P1-2 | Stripe Connect Onboarding UI |
| P1-3 | Invoice Payment Collection (Stripe Elements) |
| P1-4 | Payment Links |
| P1-5 | Portal Customer Payment (Pay Now) |
| P1-6 | Automatic Receipts & Notifications |
| P1-7 | Express Service (full feature) |
| P1-8 | Onboarding Enhancement |
| P1-9 | Test Transaction Flow |
| P1-10 | HOW TO Documentation |

## P2/P3 Deferred

- Customer memberships / service agreements
- Membership entitlements + recurring billing
- Advanced booking, storefront, SMS consent
- Document signatures, reviews, advanced workflows

---

## Mandatory Architectural Invariants

1. **Never route subscriber customer funds through Aardvark's platform account**
2. **Always use `Stripe-Account` header for Domain B/C Stripe API calls**
3. **Payment amount is server-authoritative (from invoice.balance_due)**
4. **Idempotency keys (UNIQUE constraint) prevent duplicate charges**
5. **Webhook event.id prevents duplicate reconciliation**
6. **All financial operations within single DB transaction**
7. **Tenant isolation: tenant_id in every WHERE clause**
8. **New features default OFF for existing subscribers**
9. **Existing API responses backward-compatible (additive only)**
10. **Raw webhook body preserved before JSON parsing for signature verification**

## Mandatory Validation Gates

Before any payment feature goes live:
- [ ] Webhook signature verification passing
- [ ] Tenant resolution from event.account working
- [ ] Idempotency deduplication proven
- [ ] Amount validation (server authoritative) proven
- [ ] Cross-tenant isolation proven
- [ ] Refund balance check proven
- [ ] Connected account ownership verified on every Stripe call

---

## Important Existing Files/Components

| Purpose | File |
|---------|------|
| Router | `apps/api/src/router.js` |
| Tenant middleware | `apps/api/src/middleware/tenant.js` |
| Permissions | `apps/api/src/auth/permissions.js` |
| Invoice repo | `apps/api/src/repositories/invoiceRepository.js` |
| Payment repo | `apps/api/src/repositories/paymentRepository.js` |
| Payment service | `apps/api/src/services/paymentService.js` |
| Settings repo | `apps/api/src/repositories/tenantSettingsRepository.js` |
| Settings service | `apps/api/src/services/tenantSettingsService.js` |
| Portal routes | `apps/api/src/routes/portal.js` |
| Portal auth | `apps/api/src/middleware/portalAuthGuard.js` |
| Portal token | `apps/api/src/services/portalTokenService.js` |
| Pricing engine | `apps/api/src/services/pricingService.js` |
| Notifications | `apps/api/src/services/notificationService.js` |
| Trial/onboarding | `apps/api/src/routes/trial.js` |
| DB context | `apps/api/src/middleware/databaseContext.ts` |
| Storefront | `apps/api/src/routes/publicStorefront.js` |

## Migration Strategy

- Next available: **782**
- Forward-only, idempotent (IF NOT EXISTS)
- Do not edit migrations ≤ 781
- All new tables include tenant_id
- ALTER existing tables with ADD COLUMN IF NOT EXISTS + defaults

## Required Environment Variables (New)

```
STRIPE_WEBHOOK_SECRET_PLATFORM=whsec_...    (Domain A webhooks)
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_...     (Domain B/C Connect webhooks)
```

Existing `STRIPE_SECRET_KEY` remains for platform operations.
Connected account operations use same key but with `Stripe-Account` header.

## Known Risks

1. Free Render tier has 50s+ cold start — webhook timeout risk. Mitigate: Stripe retries.
2. SMS not production-ready (Twilio configured but consent management missing). Do not claim SMS works for payment notifications until consent is built.
3. Existing portal invoice list filters in memory — fix with DB WHERE clause before enabling portal payments.

## Known Blockers

- None for P0/P1 implementation. All required infrastructure is available.
- P2 memberships require the full P0 + connected account to be operational first.
