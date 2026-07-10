# Sprint 149 - Finance Operations and Revenue Recognition

Apply this patch over Sprint 148.

## Endpoints to wire

```text
POST /api/v1/finance/periods
POST /api/v1/finance/periods/:id/lock
POST /api/v1/finance/periods/:id/close
POST /api/v1/finance/revenue-schedules
POST /api/v1/finance/revenue-schedules/:id/activate
POST /api/v1/finance/revenue-schedules/:id/recognize
POST /api/v1/finance/tax-profiles
POST /api/v1/finance/tax-profiles/:id/validate
POST /api/v1/finance/refunds
POST /api/v1/finance/refunds/:id/approve
POST /api/v1/finance/refunds/:id/process
POST /api/v1/finance/payouts
POST /api/v1/finance/payouts/:id/approve
POST /api/v1/finance/payouts/:id/pay
POST /api/v1/finance/ledger
POST /api/v1/finance/ledger/:id/post
POST /api/v1/finance/reconciliations
POST /api/v1/finance/reconciliations/:id/start
POST /api/v1/finance/reconciliations/:id/complete
GET  /api/v1/finance/ledger-balanced
GET  /api/v1/finance/metrics
```

## Seed

```powershell
npm run seed:finance
```
