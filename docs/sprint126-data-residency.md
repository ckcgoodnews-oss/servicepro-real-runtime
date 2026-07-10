# Sprint 126 - Data Residency and Localization

Apply this patch over Sprint 125.

## Endpoints to wire

```text
GET  /api/v1/data-residency/policies
POST /api/v1/data-residency/policies
GET  /api/v1/data-residency/assignments
POST /api/v1/data-residency/assignments
GET  /api/v1/data-residency/transfers
POST /api/v1/data-residency/transfers
POST /api/v1/data-residency/transfers/:id/evaluate
POST /api/v1/data-residency/transfers/:id/approve
POST /api/v1/data-residency/transfers/:id/reject
POST /api/v1/data-residency/transfers/:id/complete
GET  /api/v1/data-residency/requirements
POST /api/v1/data-residency/requirements
POST /api/v1/data-residency/requirements/:id/satisfy
GET  /api/v1/data-residency/violations
POST /api/v1/data-residency/violations
POST /api/v1/data-residency/violations/:id/remediate
POST /api/v1/data-residency/violations/:id/close
POST /api/v1/data-residency/transfers/:id/approvals
POST /api/v1/data-residency/approvals/:id/approve
POST /api/v1/data-residency/approvals/:id/reject
GET  /api/v1/data-residency/metrics
```

## Seed

```powershell
npm run seed:data-residency
```
