# Sprint 131 - Processing Inventory and DPIA

Apply this patch over Sprint 130.

## Endpoints to wire

```text
GET  /api/v1/processing-inventory/activities
POST /api/v1/processing-inventory/activities
POST /api/v1/processing-inventory/activities/:id/review
GET  /api/v1/processing-inventory/activities/:id/data-categories
POST /api/v1/processing-inventory/activities/:id/data-categories
GET  /api/v1/processing-inventory/activities/:id/system-mappings
POST /api/v1/processing-inventory/activities/:id/system-mappings
GET  /api/v1/processing-inventory/dpias
POST /api/v1/processing-inventory/activities/:id/dpias
POST /api/v1/processing-inventory/dpias/:id/submit
POST /api/v1/processing-inventory/dpias/:id/decisions
GET  /api/v1/processing-inventory/tasks
POST /api/v1/processing-inventory/dpias/:id/tasks
POST /api/v1/processing-inventory/tasks/:id/complete
GET  /api/v1/processing-inventory/metrics
```

## Seed

```powershell
npm run seed:processing-inventory
```
