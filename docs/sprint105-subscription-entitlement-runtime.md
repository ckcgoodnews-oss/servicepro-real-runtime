# Sprint 105 - Subscription and Entitlement Runtime

Apply this patch over Sprint 104.

## Endpoints to wire

```text
GET  /api/v1/subscription/plans
POST /api/v1/subscription/plans
GET  /api/v1/subscription/plans/:id/entitlements
POST /api/v1/subscription/plans/:id/entitlements

GET  /api/v1/subscription/subscriptions
POST /api/v1/subscription/subscriptions
POST /api/v1/subscription/entitlements/evaluate

GET  /api/v1/subscription/meters
POST /api/v1/subscription/meters
POST /api/v1/subscription/usage
POST /api/v1/subscription/usage/aggregate

GET  /api/v1/subscription/invoices
POST /api/v1/subscription/invoices
POST /api/v1/subscription/invoices/generate
POST /api/v1/subscription/invoices/:id/pay
```

## Seed

```powershell
npm run seed:subscription
```
