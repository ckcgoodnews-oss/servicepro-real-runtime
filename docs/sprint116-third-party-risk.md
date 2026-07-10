# Sprint 116 - Third-Party Risk Management

Apply this patch over Sprint 115.

## Endpoints to wire

```text
GET  /api/v1/third-party-risk/vendors
POST /api/v1/third-party-risk/vendors
GET  /api/v1/third-party-risk/vendors/:id/assessments
POST /api/v1/third-party-risk/vendors/:id/assessments
POST /api/v1/third-party-risk/assessments/:id/complete
GET  /api/v1/third-party-risk/assessments/:id/responses
POST /api/v1/third-party-risk/assessments/:id/responses
GET  /api/v1/third-party-risk/findings
POST /api/v1/third-party-risk/vendors/:id/findings
POST /api/v1/third-party-risk/findings/:id/transition
GET  /api/v1/third-party-risk/findings/:id/remediation-tasks
POST /api/v1/third-party-risk/findings/:id/remediation-tasks
POST /api/v1/third-party-risk/remediation-tasks/:id/complete
POST /api/v1/third-party-risk/findings/:id/exceptions
POST /api/v1/third-party-risk/exceptions/:id/approve
POST /api/v1/third-party-risk/exceptions/:id/reject
GET  /api/v1/third-party-risk/vendors/:id/risk
GET  /api/v1/third-party-risk/metrics
```

## Seed

```powershell
npm run seed:third-party-risk
```
