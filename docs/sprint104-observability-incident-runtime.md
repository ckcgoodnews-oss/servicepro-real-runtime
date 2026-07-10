# Sprint 104 - Observability and Incident Management Runtime

Apply this patch over Sprint 103.

## Endpoints to wire

```text
GET  /api/v1/observability/monitors
POST /api/v1/observability/monitors
GET  /api/v1/observability/slos
POST /api/v1/observability/slos
POST /api/v1/observability/slos/evaluate
GET  /api/v1/observability/alerts
POST /api/v1/observability/alerts
POST /api/v1/observability/alerts/:id/acknowledge
POST /api/v1/observability/alerts/:id/resolve
GET  /api/v1/observability/incidents
POST /api/v1/observability/incidents
POST /api/v1/observability/incidents/:id/transition
GET  /api/v1/observability/incidents/:id/timeline
POST /api/v1/observability/incidents/:id/timeline
GET  /api/v1/observability/summary
```

## Seed

```powershell
npm run seed:observability
```
