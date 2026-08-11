# 07 — Security Model

## Payment Security Acceptance Criteria

Implementation MUST prove:

| # | Criterion | How |
|---|-----------|-----|
| 1 | Client cannot choose authoritative payment amount | Server reads `invoice.balance_due`; client amount validated `<= balance` |
| 2 | Invoice balance is server authoritative | `balance_due` computed from DB, never from client |
| 3 | Connected-account ownership is server authoritative | `subscriber_stripe_accounts.tenant_id = req.tenantId` verified before any Stripe call |
| 4 | Subscriber setting is server authoritative | `accept_customer_payments` checked from DB on every payment request |
| 5 | Webhook metadata is not sole tenant authority | Tenant resolved from `event.account` → DB lookup, not from event metadata |
| 6 | Duplicate payment requests are idempotent | `idempotency_key` UNIQUE constraint; Stripe idempotency key passed |
| 7 | Duplicate webhooks cannot double-apply | `customer_payment_events.idempotency_key` = `evt_{event.id}` — ON CONFLICT DO NOTHING |
| 8 | Payment + invoice reconciliation is atomic | Single DB transaction: update payment + update invoice + insert ledger |
| 9 | Amount mismatch rejected | Webhook amount validated against local payment record |
| 10 | Currency mismatch rejected | Payment currency validated against invoice currency |
| 11 | Wrong connected account rejected | Stripe-Account header always from DB lookup, never from client |
| 12 | Cross-tenant access rejected | All queries include `WHERE tenant_id = $1` |

## Tenant Isolation Tests

| Test | Assertion |
|------|-----------|
| Subscriber A cannot read Subscriber B settings | GET settings with tenant A token returns only A's data |
| Subscriber A cannot modify Subscriber B settings | PATCH with A's token targeting B's tenant rejected |
| Subscriber A cannot use Subscriber B Stripe account | Payment intent creation verifies account ownership |
| Subscriber A cannot collect against Subscriber B invoice | Invoice lookup scoped by tenant_id |
| Subscriber A cannot refund Subscriber B payment | Refund validates payment.tenant_id = requester tenant |
| Customer A cannot access Customer B invoice | Portal queries scoped by portal customer_id (DB WHERE, not memory filter) |
| Forged webhook metadata cannot switch tenants | Tenant resolved from event.account via DB, not metadata |
| Wrong Stripe account cannot mutate local records | account_id validated against subscriber_stripe_accounts |
| Client cannot alter authoritative charge amount | Amount from server; client amount is validation ceiling only |
| Duplicate request cannot create duplicate charge | idempotency_key UNIQUE + Stripe Idempotency-Key header |
| Duplicate webhook cannot duplicate reconciliation | Ledger idempotency_key = evt_{id} — ON CONFLICT DO NOTHING |

## Webhook Security

```
1. Raw body preserved (before JSON parsing)
2. Stripe-Signature header parsed:
   - Extract t= (timestamp)
   - Extract all v1= signatures
3. Timestamp tolerance: reject if |now - timestamp| > 300 seconds
4. Compute HMAC-SHA256(secret, "{timestamp}.{rawBody}")
5. Timing-safe compare against each v1 signature
6. If no match → 400 response
7. Parse event from raw body
8. Check event.id against ledger idempotency_key (dedup)
9. Resolve tenant from event.account (connect endpoint)
10. Reject if tenant not found
```

## Additional Threat Mitigations

| Threat | Mitigation |
|--------|-----------|
| IDOR on invoices/payments | All queries scoped by tenant_id + customer_id where applicable |
| CSRF | API uses Bearer token auth (no cookies for API calls) |
| Stripe account substitution | Connected account ID from DB, never from request body |
| Webhook forgery | Signature verification + timestamp tolerance |
| Webhook replay | Event ID idempotency in ledger table |
| Refund abuse | Permission-gated + refundable balance check |
| File upload (Express Service) | Type validation, size limit (10MB), content-type check |
| PII logging | Stripe keys never logged; Sentry breadcrumbs redacted |
| SMS consent | SMS only sent if customer has active consent record |
| Payment link enumeration | Tokens: 128-bit random, short-lived (configurable TTL) |
| Sensitive property info | Access instructions require elevated permission + audit log |

## Permission Model

New permissions (auto-discovered by existing `permissions.js`):

```
PAYMENTS_VIEW              → payments.view
PAYMENTS_COLLECT           → payments.collect
PAYMENTS_REFUND            → payments.refund
PAYMENTS_RECONCILE         → payments.reconcile
PAYMENTS_CONFIGURE         → payments.configure
PAYMENTS_CONNECT_STRIPE    → payments.connect.stripe
BILLING_SETTINGS_MANAGE    → billing.settings.manage
MEMBERSHIPS_VIEW           → memberships.view
MEMBERSHIPS_MANAGE         → memberships.manage
MEMBERSHIPS_CANCEL         → memberships.cancel
MEMBERSHIPS_REFUND         → memberships.refund
EXPRESS_SERVICE_READ       → express.service.read
EXPRESS_SERVICE_WRITE      → express.service.write
EXPRESS_SERVICE_CONFIGURE  → express.service.configure
```

### Role Mapping

| Role | Payment Permissions |
|------|-------------------|
| owner | All |
| admin | All |
| manager | view, collect, reconcile |
| billing | view, collect, refund, reconcile, configure, billing.settings.manage |
| technician | express.service.read |
| read_only | view only |
