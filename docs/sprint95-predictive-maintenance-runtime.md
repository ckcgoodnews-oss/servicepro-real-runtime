# Sprint 95 - Predictive Maintenance Runtime

Apply this patch over Sprint 94.

## Endpoints to wire

```text
GET  /api/v1/predictive-maintenance/models
POST /api/v1/predictive-maintenance/models

GET  /api/v1/predictive-maintenance/predictions
POST /api/v1/predictive-maintenance/predictions/generate
GET  /api/v1/predictive-maintenance/predictions/:id
POST /api/v1/predictive-maintenance/predictions/:id/convert
POST /api/v1/predictive-maintenance/predictions/:id/dismiss
```

## Seed

```powershell
npm run seed:predictive-maintenance
```
