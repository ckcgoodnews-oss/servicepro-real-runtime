# Sprint 150 - Enterprise Audit and Compliance Evidence

Apply this patch over Sprint 149.

## Endpoints to wire

```text
POST /api/v1/audit-compliance/programs
POST /api/v1/audit-compliance/programs/:id/activate
POST /api/v1/audit-compliance/programs/:id/close
POST /api/v1/audit-compliance/controls
POST /api/v1/audit-compliance/controls/:id/activate
POST /api/v1/audit-compliance/controls/:id/retire
POST /api/v1/audit-compliance/evidence-requests
POST /api/v1/audit-compliance/evidence-requests/:id/submit
POST /api/v1/audit-compliance/evidence-requests/:id/accept
POST /api/v1/audit-compliance/evidence-requests/:id/reject
POST /api/v1/audit-compliance/artifacts
POST /api/v1/audit-compliance/artifacts/:id/accept
POST /api/v1/audit-compliance/artifacts/:id/reject
POST /api/v1/audit-compliance/control-tests
POST /api/v1/audit-compliance/control-tests/:id/start
POST /api/v1/audit-compliance/control-tests/:id/complete
POST /api/v1/audit-compliance/findings
POST /api/v1/audit-compliance/findings/:id/remediate
POST /api/v1/audit-compliance/findings/:id/close
POST /api/v1/audit-compliance/findings/:id/accept-risk
POST /api/v1/audit-compliance/remediations
POST /api/v1/audit-compliance/remediations/:id/start
POST /api/v1/audit-compliance/remediations/:id/complete
POST /api/v1/audit-compliance/attestations
POST /api/v1/audit-compliance/attestations/:id/submit
POST /api/v1/audit-compliance/attestations/:id/accept
GET  /api/v1/audit-compliance/ready
GET  /api/v1/audit-compliance/metrics
```

## Seed

```powershell
npm run seed:audit-compliance
```
