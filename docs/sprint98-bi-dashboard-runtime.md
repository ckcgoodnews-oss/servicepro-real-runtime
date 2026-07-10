# Sprint 98 - BI Dashboard Runtime

Apply this patch over Sprint 97.

## Endpoints to wire

```text
GET  /api/v1/bi/dashboards
POST /api/v1/bi/dashboards
GET  /api/v1/bi/dashboards/:id
GET  /api/v1/bi/dashboards/:id/render

GET  /api/v1/bi/dashboards/:id/widgets
POST /api/v1/bi/dashboards/:id/widgets

GET  /api/v1/bi/metrics
POST /api/v1/bi/metrics
POST /api/v1/bi/summary
```

## Seed

```powershell
npm run seed:bi
```
