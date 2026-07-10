# Sprint 108 - Support Operations Runtime

Apply this patch over Sprint 107.

## Endpoints to wire

```text
GET  /api/v1/support/slas
POST /api/v1/support/slas
GET  /api/v1/support/tickets
POST /api/v1/support/tickets
POST /api/v1/support/tickets/:id/transition
POST /api/v1/support/tickets/:id/first-response
POST /api/v1/support/tickets/:id/evaluate-sla
GET  /api/v1/support/tickets/:id/comments
POST /api/v1/support/tickets/:id/comments
GET  /api/v1/support/escalations
POST /api/v1/support/escalations
POST /api/v1/support/escalations/:id/acknowledge
POST /api/v1/support/escalations/:id/resolve
GET  /api/v1/support/articles
POST /api/v1/support/articles
POST /api/v1/support/health-signals
GET  /api/v1/support/customer-health/:tenantId
```

## Seed

```powershell
npm run seed:support
```
