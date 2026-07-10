# Sprint 128 - Data Retention and Records Lifecycle

Apply this patch over Sprint 127.

## Endpoints to wire

```text
GET  /api/v1/data-retention/policies
POST /api/v1/data-retention/policies
GET  /api/v1/data-retention/record-classes
POST /api/v1/data-retention/record-classes
GET  /api/v1/data-retention/schedules
POST /api/v1/data-retention/schedules
POST /api/v1/data-retention/schedules/:id/eligible
POST /api/v1/data-retention/schedules/:id/block-hold
POST /api/v1/data-retention/schedules/:id/unblock-hold
POST /api/v1/data-retention/schedules/:id/reviews
POST /api/v1/data-retention/reviews/:id/approve
POST /api/v1/data-retention/reviews/:id/reject
POST /api/v1/data-retention/schedules/:id/dispose
POST /api/v1/data-retention/deletion-jobs
POST /api/v1/data-retention/deletion-jobs/:id/start
POST /api/v1/data-retention/deletion-jobs/:id/complete
GET  /api/v1/data-retention/metrics
```

## Seed

```powershell
npm run seed:data-retention
```
