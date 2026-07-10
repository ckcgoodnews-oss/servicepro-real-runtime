# Sprint 117 - Compliance Control Mapping

Apply this patch over Sprint 116.

## Endpoints to wire

```text
GET  /api/v1/compliance-controls/frameworks
POST /api/v1/compliance-controls/frameworks
GET  /api/v1/compliance-controls/controls
POST /api/v1/compliance-controls/frameworks/:id/controls
GET  /api/v1/compliance-controls/controls/:id/evidence
POST /api/v1/compliance-controls/controls/:id/evidence
GET  /api/v1/compliance-controls/controls/:id/test-runs
POST /api/v1/compliance-controls/controls/:id/test-runs
POST /api/v1/compliance-controls/test-runs/:id/start
POST /api/v1/compliance-controls/test-runs/:id/complete
GET  /api/v1/compliance-controls/gaps
POST /api/v1/compliance-controls/controls/:id/gaps
POST /api/v1/compliance-controls/gaps/:id/close
POST /api/v1/compliance-controls/gaps/:id/accept
GET  /api/v1/compliance-controls/gaps/:id/corrective-actions
POST /api/v1/compliance-controls/gaps/:id/corrective-actions
POST /api/v1/compliance-controls/corrective-actions/:id/complete
GET  /api/v1/compliance-controls/coverage
```

## Seed

```powershell
npm run seed:compliance-controls
```
