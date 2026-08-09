# Stripe Production Gate

**PAYMENTS NOT PRODUCTION READY.**

Current code uses server-side Stripe REST calls, but the create route trusts client `amountCents`, the confirm route can mark an invoice paid without webhook evidence, missing keys return simulated objects, and webhook processing has no durable idempotency/reconciliation.

Production payment entry must remain disabled until:

- amount/currency are derived from the tenant-scoped invoice on the server;
- Stripe API failures fail closed;
- webhook raw bytes and signatures are validated with timestamp tolerance;
- accepted event IDs are stored durably and duplicates are no-ops;
- only required event types reconcile payment and invoice state atomically;
- refunds/failures update both ledgers consistently;
- success, decline, authentication, duplicate, retry, and refund cases pass in Stripe test mode.

Live keys belong only in Render secrets. Browser redirects are never payment proof.
