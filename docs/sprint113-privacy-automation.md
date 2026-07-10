# Sprint 113 - Privacy Automation

Apply this patch over Sprint 112.

## Endpoints to wire

```text
GET  /api/v1/privacy/requests
POST /api/v1/privacy/requests
POST /api/v1/privacy/requests/:id/verify-identity
POST /api/v1/privacy/requests/:id/complete
POST /api/v1/privacy/requests/:id/reject
GET  /api/v1/privacy/consents
POST /api/v1/privacy/consents
POST /api/v1/privacy/consents/:id/withdraw
POST /api/v1/privacy/export-jobs
POST /api/v1/privacy/export-jobs/:id/start
POST /api/v1/privacy/export-jobs/:id/complete
POST /api/v1/privacy/redaction-tasks
POST /api/v1/privacy/redaction-tasks/:id/complete
POST /api/v1/privacy/erasure-approvals
POST /api/v1/privacy/erasure-approvals/:id/approve
POST /api/v1/privacy/erasure-approvals/:id/reject
GET  /api/v1/privacy/requests/:id/audit
GET  /api/v1/privacy/summary
```

## Seed

```powershell
npm run seed:privacy
```
