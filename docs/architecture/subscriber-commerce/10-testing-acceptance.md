# 10 — Testing & Acceptance Criteria

## Required Regression Tests

### Tenant Isolation

| # | Test | Expected |
|---|------|----------|
| 1 | GET /api/v1/settings/billing/customer-payments (Tenant A token) | Returns only Tenant A settings |
| 2 | PATCH settings with Tenant A token targeting Tenant B data | 403 or scoped to A |
| 3 | POST /api/v1/payments/create-intent with invoice from Tenant B | 404 (invoice not found in A's scope) |
| 4 | POST /api/v1/payments/:id/refund where payment belongs to Tenant B | 404 |
| 5 | GET /portal/api/invoices/:id where invoice belongs to Customer B | 404 |
| 6 | Webhook with event.account = Tenant B's stripe_account_id | Does not affect Tenant A records |

### Payment Security

| # | Test | Expected |
|---|------|----------|
| 7 | POST create-intent with amountCents > invoice.balance_due | 400 validation error |
| 8 | POST create-intent with currency != invoice currency | 400 validation error |
| 9 | POST create-intent with duplicate idempotencyKey | Returns existing payment (no new charge) |
| 10 | Webhook payment_intent.succeeded with duplicate event.id | No double-application (ledger idempotent) |
| 11 | Webhook with invalid signature | 400 rejected |
| 12 | Webhook with timestamp > 300s old | 400 rejected |
| 13 | Webhook with unknown event.account | Ignored/rejected |
| 14 | POST create-intent when accept_customer_payments = false | 403 |
| 15 | POST create-intent when Stripe account disconnected | 403 |
| 16 | POST refund when payment.refunded_amount_cents + request > original | 400 |

### Webhook Reconciliation

| # | Test | Expected |
|---|------|----------|
| 17 | payment_intent.succeeded webhook | Payment status → succeeded, invoice balance reduced, ledger entry created |
| 18 | Same webhook delivered twice | Second delivery is no-op |
| 19 | payment_intent.payment_failed webhook | Payment status → failed, ledger event recorded, invoice unchanged |
| 20 | charge.refunded webhook | Refund recorded, invoice adjusted, ledger event |
| 21 | account.updated webhook (charges_enabled: false) | Local status synced, payments disabled if setting dependent |

### Permission Tests

| # | Test | Expected |
|---|------|----------|
| 22 | Technician role calls POST /api/v1/payments/create-intent | 403 |
| 23 | Billing role calls POST /api/v1/payments/create-intent | 200 |
| 24 | Read-only role calls POST /api/v1/payments/:id/refund | 403 |
| 25 | Owner calls POST /api/v1/stripe/connect/onboard | 200 |
| 26 | Manager calls POST /api/v1/stripe/connect/disconnect | 403 |

## Nonfunctional Requirements

### Performance

- Webhook handler resolves tenant in single indexed query
- Invoice + payment loaded in single query (no N+1)
- Ledger queries require tenant_id + pagination (LIMIT default 50)
- Stripe API calls minimized: cache account status locally (sync via webhook)
- Account Link creation only on explicit user action

### Indexes (specified in 05-data-model.md)

- `subscriber_stripe_accounts(stripe_account_id)` — webhook resolution
- `subscriber_stripe_accounts(tenant_id)` — ownership check
- `customer_payment_events(idempotency_key)` — dedup
- `customer_payment_events(tenant_id, invoice_id)` — ledger query
- `payments(idempotency_key)` — duplicate prevention
- `payments(stripe_payment_intent_id)` — webhook lookup
- `invoices(payment_link_token)` — payment link resolution

### Observability

- Audit events for all financial operations (via existing audit repository)
- Structured logging: `[payment] tenant=X invoice=Y intent=Z amount=N status=S`
- Sentry: NEVER log Stripe keys, webhook secrets, full card numbers
- Sentry breadcrumbs: redact stripe_account_id (last 4 only)

### Transaction Duration

- Webhook reconciliation transaction bounded to single invoice update
- No external API calls inside DB transaction
- Pattern: validate → Stripe call (if needed) → BEGIN → update → COMMIT → notify (async)
