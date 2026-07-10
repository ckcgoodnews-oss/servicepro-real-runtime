# Sprint 83 - Communications Runtime

Apply this patch over Sprint 82.

## Endpoints to wire

```text
GET   /api/v1/communications
POST  /api/v1/communications
POST  /api/v1/communications/timeline
GET   /api/v1/communications/:id
PATCH /api/v1/communications/:id/status

GET   /api/v1/customers/:customerId/communications
GET   /api/v1/customers/:customerId/communications/timeline
```

## Seed

```powershell
npm run seed:communications
```
