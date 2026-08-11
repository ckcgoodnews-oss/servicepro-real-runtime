# 04 — Subscriber Settings Model

## Settings Architecture

Extend existing `tenant_settings` table (JSONB `features` column) and add a dedicated `subscriber_payment_settings` table for payment-specific configuration.

## Settings Taxonomy

### CUSTOMER EXPERIENCE

| Setting | Storage | Default |
|---------|---------|---------|
| `customerPortal.enabled` | features JSONB | true |
| `customerPortal.loginPolicy` | features JSONB | `invite_only` |
| `onlineBooking.enabled` | features JSONB | false |
| `publicStorefront.enabled` | branding JSONB (`publicPublished`) | false |
| `customerSelfService.enabled` | features JSONB | false |
| `expressService.enabled` | `express_service_settings` table | false |

### SALES

| Setting | Storage | Default |
|---------|---------|---------|
| `estimates.enabled` | features JSONB | true |
| `estimates.requireApproval` | features JSONB | false |
| `estimates.digitalSignature` | features JSONB | false |
| `estimates.expirationDays` | features JSONB | 30 |
| `estimates.optionalItems` | features JSONB | false |
| `estimates.depositRequired` | features JSONB | false |
| `estimates.autoConvertToJob` | features JSONB | false |

### BILLING

| Setting | Storage | Default |
|---------|---------|---------|
| `invoices.enabled` | features JSONB | true |
| `invoices.numberingPrefix` | features JSONB | `INV-` |
| `invoices.paymentTermsDays` | features JSONB | 30 |
| `invoices.taxEnabled` | features JSONB | false |
| `customerPayments.enabled` | `subscriber_payment_settings.accept_customer_payments` | **false** |
| `customerPayments.defaultCurrency` | `subscriber_payment_settings` | `usd` |
| `customerPayments.acceptedMethods` | `subscriber_payment_settings` | `["card"]` |
| `customerPayments.depositsEnabled` | `subscriber_payment_settings` | false |
| `customerPayments.progressPaymentsEnabled` | `subscriber_payment_settings` | false |
| `customerPayments.partialPaymentsEnabled` | `subscriber_payment_settings` | true |
| `customerPayments.savedPaymentMethods` | `subscriber_payment_settings` | false |
| `customerPayments.tipsEnabled` | `subscriber_payment_settings` | false |
| `customerPayments.convenienceFeeEnabled` | `subscriber_payment_settings` | false |
| `customerPayments.convenienceFeePercent` | `subscriber_payment_settings` | 0 |
| `customerPayments.automaticReceipts` | `subscriber_payment_settings` | true |
| `customerPayments.paymentReminders` | `subscriber_payment_settings` | false |
| `customerPayments.refundPermission` | `subscriber_payment_settings` | `owner_only` |
| `customerMemberships.enabled` | features JSONB | false |

### SERVICE DELIVERY

| Setting | Storage | Default |
|---------|---------|---------|
| `scheduling.enabled` | features JSONB (`dispatch`) | true |
| `serviceAreas.enabled` | features JSONB | false |
| `equipment.enabled` | features JSONB | true |
| `signatures.requiredOnCompletion` | features JSONB | false |
| `photos.requiredOnCompletion` | features JSONB | false |

### COMMUNICATIONS

| Setting | Storage | Default |
|---------|---------|---------|
| `communications.emailEnabled` | features JSONB | true |
| `communications.smsEnabled` | features JSONB | false |
| `communications.appointmentConfirmation` | features JSONB | true |
| `communications.technicianOnTheWay` | features JSONB | false |
| `communications.estimateNotices` | features JSONB | true |
| `communications.invoiceNotices` | features JSONB | true |
| `communications.paymentReceipts` | features JSONB | true |
| `communications.paymentReminders` | features JSONB | false |
| `communications.reviewRequests` | features JSONB | false |

## Dependency / Validation Rules

```
accept_customer_payments = true REQUIRES:
  subscriber_stripe_accounts.charges_enabled = true

customerPayments.depositsEnabled REQUIRES:
  accept_customer_payments = true

customerPayments.tipsEnabled REQUIRES:
  accept_customer_payments = true

customerPayments.convenienceFeeEnabled REQUIRES:
  accept_customer_payments = true

customerMemberships.enabled REQUIRES:
  accept_customer_payments = true

expressService.paymentRequired REQUIRES:
  accept_customer_payments = true
```

## Customer Payments Settings UI Location

```
Settings → Billing → Customer Payments

Sections:
  1. Master toggle (Accept Customer Payments ON/OFF)
  2. Stripe Account status (Connected/Not Connected, charges/payouts status)
  3. Payment Methods (card, ACH)
  4. Deposits & Partial Payments
  5. Tips & Convenience Fees
  6. Receipts & Reminders
  7. Refund Authorization (who can refund)
```
