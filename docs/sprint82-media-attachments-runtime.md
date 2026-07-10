# Sprint 82 - Media Attachments Runtime

Apply this patch over Sprint 81.

## Endpoints to wire

```text
GET    /api/v1/media
POST   /api/v1/media
GET    /api/v1/media/:id
PATCH  /api/v1/media/:id
DELETE /api/v1/media/:id

GET    /api/v1/:entityType/:entityId/media
POST   /api/v1/:entityType/:entityId/media
```

Supported entity types:

```text
job, customer, asset, invoice, estimate, checklist, payment, agreement
```
