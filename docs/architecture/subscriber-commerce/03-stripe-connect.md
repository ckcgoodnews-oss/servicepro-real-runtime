# 03 — Stripe Connect Architecture

## Chosen Model: Stripe Connect Express

## Evaluation

| Model | Onboarding | Payout Control | Dashboard | KYC/AML | Disputes | Platform Liability |
|-------|------------|---------------|-----------|---------|----------|--------------------|
| Standard | Subscriber manages | Subscriber | Subscriber's own | Subscriber | Subscriber | Minimal |
| **Express** | **Stripe-hosted** | **Subscriber (auto)** | **Express Dashboard** | **Stripe handles** | **Subscriber via Dashboard** | **Minimal** |
| Custom | Platform builds all | Platform controls | Platform builds | Platform handles | Platform builds | Maximum |

## Rationale

1. **Regulatory:** Stripe handles KYC/AML. Aardvark does not become a money transmitter.
2. **Onboarding UX:** Stripe-hosted Account Links — compliant, maintained flows.
3. **Disputes:** Subscribers manage via Express Dashboard. Aardvark records status only.
4. **Funds isolation:** Customer payments land in subscriber's connected balance directly.
5. **Payout:** Express accounts receive automatic payouts. No Aardvark payout administration.
6. **PCI scope:** No expansion beyond Stripe.js/Elements integration.
7. **Future revenue share:** Express supports `application_fee_amount` if needed later.

## Account Lifecycle

| State | charges_enabled | payouts_enabled | Meaning |
|-------|-----------------|-----------------|---------|
| `pending` | false | false | Account created, onboarding not started |
| `onboarding` | false | false | Subscriber in Stripe onboarding flow |
| `restricted` | false | false | Additional info required by Stripe |
| `active` | true | true | Ready to accept payments |
| `restricted_soon` | true | true | Upcoming deadline for additional info |
| `disabled` | false | false | Account disabled by Stripe |
| `disconnected` | — | — | Subscriber unlinked (soft-delete) |

## Onboarding Flow

```
1. Subscriber clicks "Connect Stripe" in Settings → Billing → Customer Payments
2. API: POST /api/v1/stripe/connect/onboard
   → stripe.accounts.create({ type: 'express', ... })
   → stripe.accountLinks.create({ account, type: 'account_onboarding', ... })
   → Returns { accountId, accountLinkUrl }
3. Subscriber redirected to Stripe-hosted onboarding
4. Onboarding complete → redirect to return_url
5. ServicePro receives account.updated webhook
   → Syncs: charges_enabled, payouts_enabled, details_submitted
6. If charges_enabled = true → subscriber can enable Accept Customer Payments
7. If restricted → show "Complete Setup" link (refresh Account Link)
```

## Account Link / Refresh Flow

```
POST /api/v1/stripe/connect/onboard     → Initial link
POST /api/v1/stripe/connect/refresh-link → Refresh (for restricted/reconnection)
```

Both use `stripe.accountLinks.create()` — Account Links are single-use and short-lived.

## Disconnect / Reconnect

- **Disconnect:** Soft-delete locally (set `disconnected_at`, status = 'disconnected'). Do NOT delete the Stripe account.
- **Reconnect:** Create new Account Link for existing `stripe_account_id` if not actually deleted at Stripe.

## Webhook Model

### Platform endpoint: `/api/webhooks/stripe/platform`
- Env: `STRIPE_WEBHOOK_SECRET_PLATFORM`
- Events: `invoice.*`, `customer.subscription.*`, `checkout.session.*`
- Domain A only

### Connect endpoint: `/api/webhooks/stripe/connect`
- Env: `STRIPE_WEBHOOK_SECRET_CONNECT`
- Events from connected accounts:
  - `account.updated` → Sync account status
  - `payment_intent.succeeded` → Reconcile payment
  - `payment_intent.payment_failed` → Record failure
  - `charge.refunded` → Record refund, adjust invoice
  - `charge.dispute.created` → Record dispute
  - `charge.dispute.closed` → Record outcome

## Tenant Resolution from Webhook

```
Connect webhook event includes: event.account = "acct_XXXX"
Resolution: SELECT tenant_id FROM subscriber_stripe_accounts
            WHERE stripe_account_id = $1 AND status != 'disconnected'
REJECT if: no matching tenant (forged/orphan event)
```

## Payment Intent Model (Domain B)

```javascript
// Create Payment Intent on connected account
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountCents,          // Server-authoritative from invoice.balance_due
  currency: invoice.currency,
  metadata: {
    tenant_id: tenantId,
    invoice_id: invoiceId,
    customer_id: customerId,
    idempotency_source: 'servicepro'
  }
}, {
  stripeAccount: connectedAccountId,   // Stripe-Account header
  idempotencyKey: idempotencyKey       // Prevents duplicate charges
});
```

## Refund Model

```javascript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: refundAmountCents  // Optional for partial
}, {
  stripeAccount: connectedAccountId  // MUST match original charge account
});
```

## Dispute Model

- Disputes surfaced via `charge.dispute.created` Connect webhook
- ServicePro records dispute status for reporting
- Subscriber manages evidence via Express Dashboard
- P0/P1 does not build evidence submission UI
