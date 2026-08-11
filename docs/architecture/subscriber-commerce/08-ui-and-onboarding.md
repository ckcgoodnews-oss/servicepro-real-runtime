# 08 — UI, Navigation & Subscriber Onboarding

## Settings Navigation

```
Settings
├── Customer Experience
│   ├── Customer Portal
│   ├── Online Booking
│   ├── Public Storefront
│   └── Express Service
├── Sales
│   ├── Estimates
│   ├── Approvals & Signatures
│   └── Pricing Rules
├── Billing
│   ├── Invoices
│   ├── Customer Payments         ← PRIMARY NEW FEATURE
│   ├── Customer Memberships (P2)
│   └── Taxes
├── Service Delivery
│   ├── Scheduling
│   ├── Service Areas
│   └── Completion Requirements
└── Communications
    ├── Email
    ├── SMS
    └── Templates
```

## Subscriber Onboarding Sequence

Extends existing trial onboarding (`trialService.ONBOARDING_STEPS`). Resumable — each step tracked independently.

| # | Step Key | Label | Required |
|---|----------|-------|----------|
| 1 | `create_account` | Create your account | ✓ (existing) |
| 2 | `verify_email` | Verify email | ✓ (existing) |
| 3 | `choose_industry` | Choose your industry | ✓ (existing) |
| 4 | `configure_branding` | Set up your brand | (existing) |
| 5 | `add_services` | Add your services | ✓ (existing) |
| 6 | `set_prices` | Set pricing | |
| 7 | `configure_taxes` | Configure taxes | |
| 8 | `configure_service_areas` | Define service areas | |
| 9 | `configure_estimates` | Set up estimates | |
| 10 | `configure_invoices` | Configure invoices | ✓ |
| 11 | `enable_customer_payments` | Enable customer payments | |
| 12 | `connect_stripe` | Connect Stripe account | |
| 13 | `configure_payment_methods` | Choose payment methods | |
| 14 | `configure_deposits` | Set up deposits/partial payments | |
| 15 | `configure_portal` | Set up customer portal | |
| 16 | `configure_booking` | Configure online booking | |
| 17 | `configure_express_service` | Set up Express Service | |
| 18 | `configure_communications` | Configure notifications | |
| 19 | `invite_team` | Invite your team | (existing) |
| 20 | `assign_permissions` | Assign financial permissions | |
| 21 | `run_test_transaction` | Run test customer transaction | |
| 22 | `publish_storefront` | Publish portal/storefront | (existing) |

## Payment Onboarding Flow

```
1. Subscriber enables "Accept Customer Payments" toggle
2. UI: "Connect a Stripe account to accept payments from your customers"
3. Click "Connect Stripe"
4. POST /api/v1/stripe/connect/onboard → returns accountLinkUrl
5. Redirect to Stripe-hosted onboarding
6. Stripe onboarding complete → redirect to return_url
7. Webhook: account.updated → sync status
8. charges_enabled = true → enable accept_customer_payments
9. Mark 'connect_stripe' step complete
```

## Test Transaction Flow

Sandbox/test lifecycle that does NOT contaminate production reporting:

```
1. Create test customer (tagged is_test = true)
2. Create test estimate → customer accepts
3. Collect deposit (Stripe test mode if configured)
4. Create job → complete work
5. Generate invoice
6. Customer pays (test mode)
7. Webhook received → reconcile
8. Invoice status → paid
9. Send receipt
10. Show in portal
11. Optional: refund test
```

**Requirements:**
- All test records tagged `is_test = true`
- Test records excluded from financial reporting queries
- Test activity uses Stripe test-mode keys when available
