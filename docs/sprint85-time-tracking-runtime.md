# Sprint 85 - Time Tracking Runtime

Apply this patch over Sprint 84.

## Endpoints to wire

```text
GET  /api/v1/time-entries
POST /api/v1/time-entries
POST /api/v1/time-entries/summary
GET  /api/v1/time-entries/:id
POST /api/v1/time-entries/:id/clock-out
POST /api/v1/time-entries/:id/approve
```

## Seed

```powershell
npm run seed:time
```
