# 00 — Existing Architecture Inventory

**ServicePro v8.0.0-alpha.1 — Repository Discovery**

---

## EXISTS AND COMPLETE

| Component | Location | Notes |
|-----------|----------|-------|
| Tenant middleware | `apps/api/src/middleware/tenant.js` | Header-based `x-tenant-id` resolution |
| Tenant settings (CRUD) | `apps/api/src/repositories/tenantSettingsRepository.js` | PostgreSQL + JSON dual-store; branding & features as JSONB |
| Customer CRUD | `apps/api/src/routes/customers.js` + repository | Full REST, tenant-scoped |
| Invoice CRUD + line calc | `apps/api/src/repositories/invoiceRepository.js` | Pricing engine, balance tracking, `FOR UPDATE` locking on `recordPayment` |
| Estimate CRUD + line calc | `apps/api/src/repositories/estimateRepository.js` | Pricing engine, margin tracking |
| Payment CRUD | `apps/api/src/repositories/paymentRepository.js` | Basic records (amount, method, reference, status) |
| Pricing engine | `apps/api/src/services/pricingService.js` | Line-level: qty × unitPrice, tax, margin |
| Portal auth (HMAC token) | `apps/api/src/services/portalTokenService.js` | Custom HMAC-SHA256, configurable TTL |
| Portal accounts | `apps/api/src/repositories/portalAccountRepository.js` | Email/password, tenant-scoped |
| Portal routes | `apps/api/src/routes/portal.js` | Invoices, estimates, bookings, tickets |
| Portal booking requests | `apps/api/src/repositories/portalBookingRepository.js` | Service request → job conversion |
| Public storefront | `apps/api/src/routes/publicStorefront.js` | Slug-based branded pages, service request |
| Customer assets | `apps/api/src/repositories/customerAssetRepository.js` | Equipment tracking, warranty, metadata |
| IAM / Permissions | `apps/api/src/auth/permissions.js` | Auto-discovers from source; role presets |
| Trial / onboarding | `apps/api/src/routes/trial.js` | Registration, verification, industry, checklist |
| Email (SendGrid) | `apps/api/src/services/notificationService.js` | Template substitution, graceful simulation |
| SMS (Twilio) | `apps/api/src/services/notificationService.js` | Configured via env, graceful simulation |
| Communication events | `apps/api/src/services/communicationService.js` | Multi-channel event model |
| Service marketplace | `apps/api/src/data/serviceMarketplaceCatalog.js` | 39 industry packs |
| Webhook signature verify | `apps/api/src/services/paymentService.js` | HMAC-SHA256, timestamp parsing |

## EXISTS BUT PARTIAL

| Component | Location | Gap |
|-----------|----------|-----|
| Stripe Payment Intents | `apps/api/src/services/paymentService.js` | Uses platform key only — no Connected Account support |
| Webhook handler | `apps/api/src/routes/payments.js` (`webhook()`) | Exists but **NOT registered in router.js** |
| Payment route (create/confirm/refund) | `apps/api/src/routes/payments.js` | Creates intents on Aardvark's account, not connected |
| Invoice `recordPayment` | `invoiceRepository.js` | Transactional with FOR UPDATE but only for manual payments |
| Feature flags | `tenantSettingsService.js` → `features` | Boolean flags but no `acceptCustomerPayments` flag |
| Billing monetization | `billingMonetizationRepository.js` | Full state machine but PostgreSQL impl is placeholder stubs |
| Finance/Revenue ops | `financeRevenueOpsRepository.js` | Ledger/refunds/reconciliation — routes **NOT wired** |
| Payment application events | `invoiceRepository.js` | `payment_application_events` table — only used by `recordPayment` |

## GLOBAL BUT SHOULD BE SUBSCRIBER-SCOPED

| Component | Issue |
|-----------|-------|
| `STRIPE_SECRET_KEY` env var | Single platform key — all intents on Aardvark's account |
| `STRIPE_WEBHOOK_SECRET` env var | Single endpoint secret — no per-subscriber routing |
| `paymentService.createPaymentIntent()` | No `Stripe-Account` header — charges go to platform |
| `features.payments` boolean | No distinction between "platform supports payments" and "subscriber opted in" |

## DUPLICATED

| Component | Instances | Risk |
|-----------|-----------|------|
| Subscription billing | `subscriptionService.js`, `billingMonetizationService.js`, `src/services/billing.js` | Three systems |
| Invoice concepts | `invoiceRepository.js`, `subscriptionRepository.billingInvoices`, `billingMonetizationRepository.billingInvoices` | Conflated |
| Plan definitions | `billing.js` (Starter/Growth/Pro), both subscription services | Three schemas |

## SECURITY RISK

| Risk | Location | Severity |
|------|----------|----------|
| No connected-account validation | `paymentService.js` | **CRITICAL** |
| Webhook handler not registered | `router.js` | HIGH |
| Portal invoice list filters in memory | `portal.js` → `listInvoices` | MEDIUM |
| No idempotency key on payment creation | `payments.js` → `create()` | HIGH |

## ACCOUNTING RISK

| Risk | Description |
|------|-------------|
| No financial domain separation | Platform and subscriber payments use same Stripe account |
| No ledger for customer payments | `payment_application_events` is audit only, not double-entry |
| Refund bypasses balance check | `payments.js` → `refund()` calls Stripe without validating refundable balance |

## TENANT-ISOLATION RISK

| Risk | Location |
|------|----------|
| Portal invoice leakage | Memory filter instead of DB WHERE for customer_id |
| No Stripe account ownership check | Payment intent created without verifying connected account belongs to tenant |

## MISSING (Required for Subscriber Commerce)

| Component | Priority |
|-----------|----------|
| Stripe Connect onboarding | P0 |
| `accept_customer_payments` subscriber setting | P0 |
| Connected account table / status tracking | P0 |
| Subscriber-scoped payment intent creation | P0 |
| Payment idempotency | P0 |
| Webhook routing (platform vs connect) | P0 |
| Customer payment ledger (event-sourced) | P0 |
| Atomic webhook → invoice reconciliation | P0 |
| Customer memberships / recurring billing via Connected Account | P2 |
| Express Service feature | P1 |
| Customer online payment (portal pay) | P1 |
| SMS consent management | P2 |
| Document signatures | P3 |
| Review system | P3 |

## EXPRESS SERVICE / EXPRESSED SERVICE

**Repository search result:** No implementation found. Searched:
- `Express Service`, `Expressed Service`
- `express-service`, `expressed-service`
- `expressService`, `expressedService`
- Pattern variations

**Conclusion:** Feature does not exist. No naming conflict. **Canonical name: "Express Service"**.
