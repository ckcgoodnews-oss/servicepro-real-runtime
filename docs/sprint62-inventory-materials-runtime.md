# Sprint 62 - Inventory and Material Usage Runtime

Apply this patch over Sprint 61.

## What changed

- Added inventory item CRUD.
- Added stock adjustments.
- Added job material usage.
- Material usage deducts stock.
- Added inventory/material RBAC permissions.
- Added JSON and PostgreSQL repositories.
- Added PostgreSQL migration.

## Endpoints

```text
GET    /api/v1/inventory
POST   /api/v1/inventory
GET    /api/v1/inventory/:id
PATCH  /api/v1/inventory/:id
POST   /api/v1/inventory/:id/adjust
DELETE /api/v1/inventory/:id

GET    /api/v1/materials
POST   /api/v1/materials
```

## Example material usage

```json
{
  "jobId": "job_demo_1",
  "inventoryItemId": "item_demo_1",
  "quantity": 2,
  "notes": "Used under kitchen sink"
}
```
