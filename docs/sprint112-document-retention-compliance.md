# Sprint 112 - Document Retention and Compliance

Apply this patch over Sprint 111.

## Endpoints to wire

```text
GET  /api/v1/retention/policies
POST /api/v1/retention/policies
GET  /api/v1/retention/classifications
POST /api/v1/retention/classifications
GET  /api/v1/retention/legal-holds
POST /api/v1/retention/legal-holds
POST /api/v1/retention/legal-holds/:id/release
GET  /api/v1/retention/reviews
POST /api/v1/retention/reviews
POST /api/v1/retention/reviews/:id/approve
POST /api/v1/retention/reviews/:id/reject
POST /api/v1/retention/reviews/:id/delete
POST /api/v1/retention/export-jobs
POST /api/v1/retention/export-jobs/:id/start
POST /api/v1/retention/export-jobs/:id/complete
GET  /api/v1/retention/summary
```

## Seed

```powershell
npm run seed:retention
```
