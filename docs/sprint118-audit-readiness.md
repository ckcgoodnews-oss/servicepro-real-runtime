# Sprint 118 - Audit Readiness

Apply this patch over Sprint 117.

## Endpoints to wire

```text
GET  /api/v1/audit-readiness/engagements
POST /api/v1/audit-readiness/engagements
POST /api/v1/audit-readiness/engagements/:id/transition
GET  /api/v1/audit-readiness/requests
POST /api/v1/audit-readiness/engagements/:id/requests
POST /api/v1/audit-readiness/requests/:id/submit
POST /api/v1/audit-readiness/requests/:id/accept
POST /api/v1/audit-readiness/requests/:id/reject
GET  /api/v1/audit-readiness/requests/:id/evidence-packages
POST /api/v1/audit-readiness/requests/:id/evidence-packages
POST /api/v1/audit-readiness/evidence-packages/:id/ready
POST /api/v1/audit-readiness/evidence-packages/:id/submit
GET  /api/v1/audit-readiness/engagements/:id/walkthroughs
POST /api/v1/audit-readiness/engagements/:id/walkthroughs
POST /api/v1/audit-readiness/walkthroughs/:id/complete
GET  /api/v1/audit-readiness/engagements/:id/samples
POST /api/v1/audit-readiness/engagements/:id/samples
POST /api/v1/audit-readiness/samples/:id/collect
POST /api/v1/audit-readiness/samples/:id/submit
GET  /api/v1/audit-readiness/issues
POST /api/v1/audit-readiness/engagements/:id/issues
POST /api/v1/audit-readiness/issues/:id/management-response
POST /api/v1/audit-readiness/issues/:id/close
GET  /api/v1/audit-readiness/metrics
```

## Seed

```powershell
npm run seed:audit-readiness
```
