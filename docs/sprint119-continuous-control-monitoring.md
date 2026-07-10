# Sprint 119 - Continuous Control Monitoring

Apply this patch over Sprint 118.

## Endpoints to wire

```text
GET  /api/v1/control-monitoring/monitors
POST /api/v1/control-monitoring/monitors
GET  /api/v1/control-monitoring/monitors/:id/signals
POST /api/v1/control-monitoring/monitors/:id/signals
POST /api/v1/control-monitoring/monitors/:id/evaluate
GET  /api/v1/control-monitoring/evaluations
GET  /api/v1/control-monitoring/alerts
POST /api/v1/control-monitoring/alerts/:id/acknowledge
POST /api/v1/control-monitoring/alerts/:id/resolve
GET  /api/v1/control-monitoring/suppressions
POST /api/v1/control-monitoring/monitors/:id/suppressions
POST /api/v1/control-monitoring/suppressions/:id/revoke
GET  /api/v1/control-monitoring/metrics
```

## Seed

```powershell
npm run seed:control-monitoring
```
