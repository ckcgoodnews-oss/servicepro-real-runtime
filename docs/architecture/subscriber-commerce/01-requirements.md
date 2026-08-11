# 01 — Requirements

## Core Business Requirement

Customer invoice payments must be an **explicit subscriber option**.

A subscriber setting equivalent to **"Accept Customer Payments"** must be configurable per tenant.

A global platform feature flag may exist for emergency shutdown or deployment control, but global enablement alone MUST NEVER make customer payments available to every subscriber.

## Effective Availability Model

```
Platform customer-payments capability enabled          (global kill-switch)
  AND Subscriber "Accept Customer Payments" = ON       (tenant setting)
  AND Subscriber Stripe account connected              (subscriber_stripe_accounts row)
  AND Connected account charges_enabled = true         (synced from Stripe)
  AND Current action authorized                        (IAM permission check)
  → Payment allowed
```

All five conditions must be true simultaneously.

## Financial Domain Separation

Three explicitly separate financial domains:

### Domain A — ServicePRO Subscription Billing

```
Subscriber (tenant)
    │
    │ ServicePRO SaaS subscription fee
    ▼
Aardvark Enterprises Stripe Account
```

Concepts: ServicePRO plans, platform Stripe Products/Prices, platform Stripe Customers, SaaS subscriptions, platform invoices, platform credits/refunds, trial conversion.

### Domain B — Subscriber Customer Invoice Payments

```
Subscriber's Customer
    │
    │ Payment for subscriber's invoice (work performed)
    ▼
Subscriber's Connected Stripe Account
```

These funds **belong to the subscriber**. Design around Stripe Connect. Do NOT route through Aardvark's account.

### Domain C — Subscriber Customer Memberships

```
Subscriber's Customer
    │
    │ Recurring service/maintenance plan payment
    ▼
Subscriber's Connected Stripe Account
```

These are products sold by subscribers to their customers. They are NOT ServicePRO subscriptions. They require separate: Stripe Customers, Products, Prices, Subscriptions, local membership records, ledger, webhooks, entitlements, cancellation, refund, and reporting concepts.

## Isolation Rules

1. Domain A Stripe calls use `STRIPE_SECRET_KEY` (platform key)
2. Domain B & C Stripe calls MUST include `Stripe-Account: {connected_account_id}` header
3. Domain A webhooks arrive at `/api/webhooks/stripe/platform`
4. Domain B & C webhooks arrive at `/api/webhooks/stripe/connect`
5. No Domain B/C funds flow through the platform account
6. Domain B/C records are tenant-scoped and NEVER cross tenant boundaries

## Safe Defaults

- New subscriber-facing features default **OFF**
- Existing functionality is not disrupted
- No payment capability without explicit opt-in + Stripe connection
