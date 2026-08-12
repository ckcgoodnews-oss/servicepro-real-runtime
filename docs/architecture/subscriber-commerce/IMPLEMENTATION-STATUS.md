# Subscriber Commerce Implementation Status

Implementation baseline: `262268cd`.

## Implemented

- Forward migrations 783–785 for connected accounts, payment settings, immutable payment events, payment ownership fields, Express Service, and receipt delivery history.
- Tenant-scoped repositories for connected accounts, payment settings, the financial event ledger, and Express Service.
- Stripe Connect Express onboarding, refresh, status, Dashboard-link, and soft-disconnect API operations.
- Subscriber opt-in with platform, tenant, connected-account, charges-enabled, and permission gates.
- Connected-account PaymentIntent creation using a server-authoritative invoice and stable idempotency.
- Separate platform and Connect webhook endpoints with raw-body signature validation and trusted account-to-tenant lookup.
- Transactional PostgreSQL success reconciliation across payment, invoice, application event, and financial ledger.
- Connected-account refund validation with webhook-authoritative, idempotent local reconciliation.
- Failed/canceled PaymentIntent reconciliation and dispute lifecycle ledger events.
- Automatic receipt dispatch after successful reconciliation with independent sent/failed/skipped delivery records.
- Opaque, hashed, expiring invoice payment links with public server-authoritative payment flow.
- Card-only method enforcement; unsupported methods and non-operational settings cannot be enabled.
- Database-scoped portal invoice isolation and portal Pay Now APIs.
- Customer Payments settings UI and Stripe Payment Element portal flow.
- Refund and payment-link administration in the invoice workspace.
- Five-section subscriber settings navigation, Customer Portal controls, and tenant-scoped commerce readiness.
- Express Service subscriber settings, customer submission/status UI, staff processing, and idempotent job/draft-invoice conversion.
- Clean customer-portal lockfile installation validated through a system-volume staging directory; portal typecheck, production build, and static export pass on Machine 1.

## Not complete

- Stripe test-mode end-to-end acceptance still requires provider credentials and a connected test account.
- Express Service secure uploads, deposits/prepayment, and automated assignment/notification delivery are disabled.
- The readiness checklist is derived and resumable; a guided transaction wizard is not included.
- Payment reminders, saved methods, tips, convenience fees, progress payments, bank payments, and wallets are disabled.

Customer payments remain subscriber opt-in and default off. Production enablement still requires all local gates, provider configuration, signed webhook registration, and a Stripe test-mode acceptance transaction.
