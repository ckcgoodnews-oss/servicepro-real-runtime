# 11 — Implementation Plan

## Priority Groups

### P0 — FINANCIAL SAFETY

Must be implemented first. No payment feature is safe without these.

---

#### P0-1: Financial Domain Separation Infrastructure

**Objective:** Database tables and repositories for connected accounts, payment settings, and ledger.

- **New files:**
  - `migrations/postgres/782_subscriber_payment_settings.sql`
  - `apps/api/src/repositories/subscriberStripeAccountRepository.js`
  - `apps/api/src/repositories/subscriberPaymentSettingsRepository.js`
  - `apps/api/src/repositories/customerPaymentEventRepository.js`
- **Modified files:**
  - `apps/api/src/middleware/databaseContext.ts` (register new repos)
- **Database impact:** 3 new tables, 2 ALTER TABLE
- **API impact:** None (infrastructure)
- **Tests:** Repository CRUD with tenant isolation
- **Acceptance:** Migration idempotent; repos scope by tenant_id; existing flow unaffected
- **Dependencies:** None

---

#### P0-2: Stripe Connect Express Account Onboarding

**Objective:** Create/manage connected accounts.

- **New files:**
  - `apps/api/src/services/stripeConnectService.js`
  - `apps/api/src/routes/stripeConnect.js`
- **Modified files:**
  - `apps/api/src/router.js` (register routes)
- **Database impact:** Writes to `subscriber_stripe_accounts`
- **API impact:** POST/GET `/api/v1/stripe/connect/*`
- **Tests:** Account creation, link generation, status sync
- **Acceptance:** onboard returns accountLinkUrl; status returns state
- **Dependencies:** P0-1

---

#### P0-3: Accept Customer Payments Setting

**Objective:** Subscriber opt-in gate with dependency validation.

- **Modified files:**
  - `apps/api/src/routes/stripeConnect.js` (add settings endpoints)
- **Database impact:** Reads/writes `subscriber_payment_settings`
- **API impact:** GET/PATCH `/api/v1/settings/billing/customer-payments`
- **Tests:** Cannot enable without Stripe active; defaults OFF
- **Acceptance:** Setting OFF by default; enable requires charges_enabled
- **Dependencies:** P0-1, P0-2

---

#### P0-4: Webhook Architecture (Platform + Connect)

**Objective:** Dual webhook endpoints with signature verification and tenant resolution.

- **New files:**
  - `apps/api/src/routes/webhooks.js`
- **Modified files:**
  - `apps/api/src/router.js` (register before auth guard)
  - Server body parsing (preserve raw body)
- **Tests:** Valid/invalid signature; timestamp replay; tenant resolution; duplicate event
- **Acceptance:** Invalid sig → 400; resolves tenant from event.account; duplicates idempotent
- **Dependencies:** P0-1, P0-2

---

#### P0-5: Payment Intent Creation on Connected Account

**Objective:** Server-authoritative payment creation with idempotency.

- **New files:**
  - `apps/api/src/services/customerPaymentService.js`
- **Modified files:**
  - `apps/api/src/routes/payments.js` (add createIntent)
  - `apps/api/src/router.js`
- **Database impact:** Inserts payments + ledger events
- **API impact:** POST `/api/v1/payments/create-intent`
- **Tests:** Amount/currency validation; idempotency; connected account ownership
- **Acceptance:** Intent on connected account; local record; ledger event; clientSecret returned
- **Dependencies:** P0-1, P0-2, P0-3

---

#### P0-6: Atomic Payment Reconciliation (Webhook)

**Objective:** Webhook-driven payment → invoice → ledger reconciliation in single transaction.

- **Modified files:**
  - `apps/api/src/routes/webhooks.js` (connect handler logic)
- **Tests:** Successful reconciliation; duplicate no-op; amount mismatch
- **Acceptance:** Single TX updates payment + invoice + ledger; duplicates safe
- **Dependencies:** P0-4, P0-5

---

#### P0-7: Refund Safety

**Objective:** Tenant-validated, balance-checked refunds on connected accounts.

- **Modified files:**
  - `apps/api/src/routes/payments.js` (enhanced refund handler)
- **Tests:** Cross-tenant rejected; over-refund rejected; partial/full succeed; ledger entry
- **Acceptance:** Only subscriber's own payments; balance enforced; ledger records refund
- **Dependencies:** P0-5, P0-6

---

#### P0-8: Permission Integration

**Objective:** Register new permissions; update role presets.

- **Modified files:**
  - Route files (reference `PERMISSIONS.*` constants)
  - `apps/api/src/auth/permissions.js` (ROLE_PRESETS updates)
- **Tests:** Role has expected permissions; unauthorized rejected
- **Dependencies:** None (parallel with P0-1)

---

### P1 — CORE SUBSCRIBER COMMERCE

Build on P0 infrastructure. Subscriber-facing UI and features.

| Task | Summary | Dependencies |
|------|---------|--------------|
| P1-1 | Customer Payments Settings UI (TSX) | P0-1–P0-3 |
| P1-2 | Stripe Connect Onboarding UI | P0-2, P1-1 |
| P1-3 | Invoice Payment Collection (admin + Stripe Elements) | P0-5, P0-6 |
| P1-4 | Payment Links (generate + public pay page) | P0-5, P0-6 |
| P1-5 | Portal Customer Payment (Pay Now) | P0-3, P0-5 |
| P1-6 | Automatic Receipts & Payment Notifications | P0-6, P0-3 |
| P1-7 | Express Service Feature (full) | P0-1–P0-6 |
| P1-8 | Subscriber Onboarding Enhancement | P0-2, P0-3 |
| P1-9 | Test Transaction Flow | P0-5, P0-6, P1-3 |
| P1-10 | HOW TO Documentation | P1-1–P1-9 |

---

### P2 — CUSTOMER RECURRING BUSINESS (Deferred)

| Task | Summary |
|------|---------|
| P2-1 | Customer Membership Plans (Stripe on connected account) |
| P2-2 | Membership Entitlement Tracking |
| P2-3 | Membership Portal Integration |
| P2-4 | Advanced Booking Settings |
| P2-5 | SMS Consent Management |
| P2-6 | Customer-Specific Pricing Engine |

### P3 — EXTENDED EXPERIENCE (Deferred)

| Task | Summary |
|------|---------|
| P3-1 | Storefront Expansion |
| P3-2 | Document Signatures |
| P3-3 | Review System |
| P3-4 | Advanced Workflow Engine |
| P3-5 | Self-Service Expansion |

---

## Execution Order

```
Phase 1 (P0):
  P0-1 → P0-2 → P0-3         (sequential)
  P0-8                          (parallel with P0-1)
  P0-4                          (after P0-2)
  P0-5                          (after P0-3 + P0-4)
  P0-6                          (after P0-5)
  P0-7                          (after P0-6)

Phase 2 (P1):
  P1-1, P1-2                    (settings UI, after P0)
  P1-3, P1-4, P1-5              (payment UIs, after P1-1)
  P1-6                           (notifications, after P0-6)
  P1-7                           (Express Service, after P0-3)
  P1-8                           (onboarding, after P1-1)
  P1-9                           (test flow, after P1-3)
  P1-10                          (docs, last)
```
