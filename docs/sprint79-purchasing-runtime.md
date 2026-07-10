# Sprint 79 - Purchasing Runtime

Apply this patch over Sprint 78.

## Endpoints to wire

```text
GET   /api/v1/vendors
POST  /api/v1/vendors
GET   /api/v1/vendors/:id
PATCH /api/v1/vendors/:id

GET   /api/v1/purchase-orders
POST  /api/v1/purchase-orders
GET   /api/v1/purchase-orders/:id
PATCH /api/v1/purchase-orders/:id
POST  /api/v1/purchase-orders/:id/receive
GET   /api/v1/purchase-orders/:id/receipts
```

## Seed

```powershell
npm run seed:purchasing
```
