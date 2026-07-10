# Sprint 78 - Price Book Runtime

Apply this patch over Sprint 77.

## Endpoints to wire

```text
GET  /api/v1/pricebook/categories
POST /api/v1/pricebook/categories
GET  /api/v1/pricebook/items
POST /api/v1/pricebook/items
GET  /api/v1/pricebook/items/:id
PATCH /api/v1/pricebook/items/:id
POST /api/v1/pricebook/items/:id/line-preview
POST /api/v1/pricebook/publish
```

## Seed

```powershell
npm run seed:pricebook
```
