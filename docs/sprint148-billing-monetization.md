# Sprint 148 - Billing and Monetization

Apply this patch over Sprint 147.

## Endpoints to wire

```text
POST /api/v1/billing/plans
POST /api/v1/billing/plans/:id/activate
POST /api/v1/billing/plans/:id/retire
GET  /api/v1/billing/plans/:id/entitlements
POST /api/v1/billing/plans/:id/entitlements
POST /api/v1/billing/subscriptions
POST /api/v1/billing/subscriptions/:id/activate
POST /api/v1/billing/subscriptions/:id/past-due
POST /api/v1/billing/subscriptions/:id/cancel
POST /api/v1/billing/invoices
POST /api/v1/billing/invoices/:id/open
POST /api/v1/billing/payments
POST /api/v1/billing/payments/:id/succeed
POST /api/v1/billing/payments/:id/fail
POST /api/v1/billing/credits
POST /api/v1/billing/credits/:id/apply
POST /api/v1/billing/dunning
POST /api/v1/billing/dunning/:id/send
POST /api/v1/billing/dunning/:id/resolve
POST /api/v1/billing/entitlements/check
GET  /api/v1/billing/metrics
```

## Seed

```powershell
npm run seed:billing
```
