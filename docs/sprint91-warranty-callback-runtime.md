# Sprint 91 - Warranty and Callback Runtime

Apply this patch over Sprint 90.

## Endpoints to wire

```text
GET  /api/v1/warranty/policies
POST /api/v1/warranty/policies

GET  /api/v1/warranty/claims
POST /api/v1/warranty/claims
POST /api/v1/warranty/claims/evaluate
POST /api/v1/warranty/claims/:id/approve
POST /api/v1/warranty/claims/:id/deny

GET  /api/v1/callbacks
POST /api/v1/callbacks
POST /api/v1/callbacks/:id/complete
```

## Seed

```powershell
npm run seed:warranty
```
