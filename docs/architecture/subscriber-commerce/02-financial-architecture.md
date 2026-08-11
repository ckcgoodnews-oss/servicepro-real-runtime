# 02 — Financial Domain Architecture

## Domain Separation

### Domain A: ServicePRO Platform Subscription Billing

**Existing systems:** `subscriptionService.js`, `billing.js`, `billingMonetizationService.js`  
**Stripe account:** Platform (Aardvark's `STRIPE_SECRET_KEY`)  
**Concepts:** Plans, Prices, platform Customers, SaaS subscriptions, platform invoices  
**Status:** No changes required for P0/P1. These systems remain separate.

### Domain B: Subscriber Customer Invoice Payments

**Existing systems to extend:** `invoiceRepository.js`, `paymentRepository.js`, `payments.js`  
**Stripe account:** Subscriber's Connected Account via Stripe Connect  
**Concepts:** Customer invoices, payment intents on connected account, deposits, partial payments, refunds, payment links, receipts  
**Status:** P0/P1 implementation target.

### Domain C: Subscriber Customer Memberships

**Status:** Does not exist. Requires new tables, services, Stripe Product/Price/Subscription on connected accounts.  
**Deferred to P2.**

## What Can Be Reused

| Existing Component | Domain | Reuse Strategy |
|-------------------|--------|----------------|
| `invoiceRepository.js` | B | Extend with payment gateway fields |
| `paymentRepository.js` | B | Extend with connected-account fields |
| `estimateRepository.js` | B | Extend with approval/signature |
| `portalBookingRepository.js` | B | Add settings-driven configuration |
| `pricingService.js` | B | Reuse line calculation engine |
| `notificationService.js` | B/C | Reuse email/SMS dispatch |
| `communicationService.js` | B/C | Reuse event model |
| `tenantSettingsRepository.js` | B/C | Extend with new settings sections |
| `permissions.js` | All | Auto-discovers new permissions |
| `portalAuthGuard.js` | B | Reuse for customer payment auth |

## Domain Confusion (Current Risk)

The billing/subscription systems (`subscriptionService`, `billingMonetizationService`, `billing.js`) all model ServicePRO-to-subscriber billing (Domain A). None model subscriber-customer invoice payments (Domain B) or memberships (Domain C).

The existing `paymentRepository` and `invoiceRepository` actually belong to Domain B (subscriber invoices to their customers) but currently use the platform Stripe key, creating Domain A / Domain B conflation.

## Resolution

- Do NOT modify Domain A systems.
- Add new infrastructure for Domain B that uses `Stripe-Account` header.
- Existing manual "Record Payment" flow continues to work (no Stripe Connect needed).
- New online payment flow requires Stripe Connect + subscriber opt-in.
