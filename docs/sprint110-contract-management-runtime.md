# Sprint 110 - Contract Management Runtime

Apply this patch over Sprint 109.

## Endpoints to wire

```text
GET  /api/v1/contracts/agreements
POST /api/v1/contracts/agreements
POST /api/v1/contracts/agreements/:id/activate
POST /api/v1/contracts/agreements/:id/terminate
POST /api/v1/contracts/agreements/:id/renewal-window
GET  /api/v1/contracts/agreements/:id/value
GET  /api/v1/contracts/agreements/:id/order-forms
POST /api/v1/contracts/agreements/:id/order-forms
GET  /api/v1/contracts/agreements/:id/terms
POST /api/v1/contracts/agreements/:id/terms
GET  /api/v1/contracts/agreements/:id/amendments
POST /api/v1/contracts/agreements/:id/amendments
POST /api/v1/contracts/amendments/:id/execute
GET  /api/v1/contracts/obligations
POST /api/v1/contracts/obligations
POST /api/v1/contracts/obligations/:id/fulfill
GET  /api/v1/contracts/portfolio
```

## Seed

```powershell
npm run seed:contracts
```
