# Sprint 137 - BCDR Governance

Apply this patch over Sprint 136.

## Endpoints to wire

```text
GET  /api/v1/bcdr/bias
POST /api/v1/bcdr/bias
POST /api/v1/bcdr/bias/:id/submit
POST /api/v1/bcdr/bias/:id/approve
GET  /api/v1/bcdr/plans
POST /api/v1/bcdr/bias/:id/plans
POST /api/v1/bcdr/plans/:id/submit
POST /api/v1/bcdr/plans/:id/approve
POST /api/v1/bcdr/plans/:id/activate
POST /api/v1/bcdr/plans/:id/approvals
POST /api/v1/bcdr/approvals/:id/approve
POST /api/v1/bcdr/approvals/:id/reject
POST /api/v1/bcdr/plans/:id/exercises
POST /api/v1/bcdr/exercises/:id/start
POST /api/v1/bcdr/exercises/:id/complete
GET  /api/v1/bcdr/exercises/:id/evidence
POST /api/v1/bcdr/exercises/:id/evidence
POST /api/v1/bcdr/plans/:id/gaps
POST /api/v1/bcdr/gaps/:id/complete
POST /api/v1/bcdr/gaps/:id/accept-risk
GET  /api/v1/bcdr/metrics
```

## Seed

```powershell
npm run seed:bcdr
```
