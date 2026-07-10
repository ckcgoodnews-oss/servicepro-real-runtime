# Sprint 80 - Warehouse Runtime

Apply this patch over Sprint 79.

## Endpoints to wire

```text
GET   /api/v1/warehouses
POST  /api/v1/warehouses
PATCH /api/v1/warehouses/:id
GET   /api/v1/warehouses/:id/bins
POST  /api/v1/warehouses/:id/bins
GET   /api/v1/warehouse-bins
POST  /api/v1/warehouse-bins

GET   /api/v1/inventory-transfers
POST  /api/v1/inventory-transfers
POST  /api/v1/inventory-transfers/:id/complete
```

## Seed

```powershell
npm run seed:warehouse
```
