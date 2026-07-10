# Sprint 120 - Operational Risk Register

Apply this patch over Sprint 119.

## Endpoints to wire

```text
GET  /api/v1/operational-risks
POST /api/v1/operational-risks
POST /api/v1/operational-risks/:id/close
GET  /api/v1/operational-risks/:id/mitigation-plans
POST /api/v1/operational-risks/:id/mitigation-plans
POST /api/v1/operational-risks/mitigation-plans/:id/complete
GET  /api/v1/operational-risks/:id/kris
POST /api/v1/operational-risks/:id/kris
POST /api/v1/operational-risks/kris/:id/value
GET  /api/v1/operational-risks/:id/reviews
POST /api/v1/operational-risks/:id/reviews
POST /api/v1/operational-risks/reviews/:id/complete
POST /api/v1/operational-risks/:id/acceptances
POST /api/v1/operational-risks/acceptances/:id/approve
POST /api/v1/operational-risks/acceptances/:id/reject
GET  /api/v1/operational-risks/metrics
```

## Seed

```powershell
npm run seed:operational-risks
```
