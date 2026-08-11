# 06 — API Contracts

All routes follow existing ServicePro conventions:
- Success: `sendJson(res, statusCode, { data })`
- Error: `sendJson(res, statusCode, { error: { code, message } })`
- Route registration in `apps/api/src/router.js` via if-chain pattern

---

## Stripe Connect Endpoints

### POST /api/v1/stripe/connect/onboard

| Field | Value |
|-------|-------|
| Actor | Subscriber admin |
| Permission | `PAYMENTS_CONNECT_STRIPE` |
| Tenant resolution | `req.context.tenantId` (auth guard) |
| Request body | `{ returnUrl: string, refreshUrl: string }` |
| Response | `{ data: { accountId, accountLinkUrl, status } }` |
| Side effects | Creates Stripe Express account if none exists; creates Account Link |
| Validation | Tenant must not have active connected account already |

### GET /api/v1/stripe/connect/status

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_CONFIGURE` |
| Response | `{ data: { accountId, status, chargesEnabled, payoutsEnabled, detailsSubmitted, country, defaultCurrency } }` |
| Side effects | None |

### POST /api/v1/stripe/connect/disconnect

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_CONNECT_STRIPE` |
| Response | `{ data: { disconnected: true } }` |
| Side effects | Sets `disconnected_at`, status='disconnected'; disables `accept_customer_payments` |

### POST /api/v1/stripe/connect/refresh-link

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_CONNECT_STRIPE` |
| Request body | `{ returnUrl: string, refreshUrl: string }` |
| Response | `{ data: { accountLinkUrl } }` |
| Side effects | Creates new Account Link for existing account |

---

## Payment Settings Endpoints

### GET /api/v1/settings/billing/customer-payments

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_CONFIGURE` |
| Response | `{ data: { acceptCustomerPayments, defaultCurrency, acceptedMethods, depositsEnabled, ..., stripeAccount: { status, chargesEnabled, ... } } }` |

### PATCH /api/v1/settings/billing/customer-payments

| Field | Value |
|-------|-------|
| Permission | `BILLING_SETTINGS_MANAGE` |
| Request body | Partial settings object |
| Validation | Cannot enable `acceptCustomerPayments` without active Stripe |
| Response | `{ data: { ...updated settings } }` |

---

## Customer Payments Endpoints

### POST /api/v1/payments/create-intent

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_COLLECT` |
| Request body | `{ invoiceId: uuid, amountCents: int, paymentType: string, idempotencyKey: string }` |
| Validation | Invoice exists + belongs to tenant; amountCents <= balance_due; Stripe active; idempotency unique |
| Response | `{ data: { paymentId, clientSecret, stripePaymentIntentId } }` |
| Side effects | Creates Payment Intent on connected account; creates local payment record; ledger event |
| Tests | Amount > balance rejected; currency mismatch rejected; wrong tenant rejected; duplicate idempotency returns existing |

### POST /api/v1/payments/:id/refund

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_REFUND` |
| Request body | `{ amountCents: int (optional), reason: string }` |
| Validation | Payment belongs to tenant; status = succeeded; amountCents <= refundable; connected account verified |
| Response | `{ data: { refundId, status, amountCents } }` |
| Side effects | Stripe refund on connected account; ledger event; invoice adjustment |

### GET /api/v1/payments/ledger

| Field | Value |
|-------|-------|
| Permission | `PAYMENTS_RECONCILE` |
| Query params | `?invoiceId=&from=&to=&type=` |
| Response | `{ data: [...ledger events] }` |

---

## Portal Payment Endpoints

### GET /portal/api/invoices/:id/payment-info

| Field | Value |
|-------|-------|
| Auth | `portalAuthGuard` |
| Validation | Invoice.customer_id = portal customer |
| Response | `{ data: { invoiceId, balanceDue, currency, acceptedMethods, depositsEnabled } }` |

### POST /portal/api/invoices/:id/pay

| Field | Value |
|-------|-------|
| Auth | `portalAuthGuard` |
| Request body | `{ amountCents: int (optional, defaults to balance) }` |
| Validation | Invoice belongs to portal customer; amountCents <= balance_due; tenant has payments enabled |
| Response | `{ data: { clientSecret, paymentIntentId } }` |
| Side effects | Creates Payment Intent on connected account |

---

## Payment Links (Unauthenticated)

### GET /api/public/pay/:token

| Field | Value |
|-------|-------|
| Auth | None (token is authorization) |
| Validation | Token exists, not expired, invoice has balance |
| Response | `{ data: { invoiceId, businessName, amountDue, currency, clientSecret } }` |

---

## Webhook Endpoints

### POST /api/webhooks/stripe/platform

| Field | Value |
|-------|-------|
| Auth | Stripe signature verification |
| Registration | Before auth guard in router.js |
| Events | Domain A: `invoice.*`, `customer.subscription.*` |
| Env | `STRIPE_WEBHOOK_SECRET_PLATFORM` |

### POST /api/webhooks/stripe/connect

| Field | Value |
|-------|-------|
| Auth | Stripe signature verification |
| Registration | Before auth guard in router.js |
| Events | Domain B/C: `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.*` |
| Env | `STRIPE_WEBHOOK_SECRET_CONNECT` |
| Tenant resolution | `event.account` → `subscriber_stripe_accounts.stripe_account_id` |

---

## Express Service Endpoints

### GET /api/v1/settings/express-service
- Permission: `EXPRESS_SERVICE_CONFIGURE`

### PATCH /api/v1/settings/express-service
- Permission: `EXPRESS_SERVICE_CONFIGURE`
- Body: `{ enabled, eligibleServiceIds, ... }`

### POST /portal/api/express-service
- Auth: `portalAuthGuard`
- Body: `{ serviceId, propertyId, description, urgency, photos }`
- Response: `{ data: { requestId, status } }`

### GET /api/v1/express-service/requests
- Permission: `EXPRESS_SERVICE_READ`

### PATCH /api/v1/express-service/requests/:id
- Permission: `EXPRESS_SERVICE_WRITE`
- Body: `{ status, assignedTechnicianId }`
