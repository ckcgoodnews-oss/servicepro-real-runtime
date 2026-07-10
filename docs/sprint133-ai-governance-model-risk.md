# Sprint 133 - AI Governance and Model Risk Management

Apply this patch over Sprint 132.

## Endpoints to wire

```text
GET  /api/v1/ai-governance/systems
POST /api/v1/ai-governance/systems
POST /api/v1/ai-governance/systems/:id/activate
POST /api/v1/ai-governance/systems/:id/pause
POST /api/v1/ai-governance/systems/:id/review
GET  /api/v1/ai-governance/assessments
POST /api/v1/ai-governance/systems/:id/assessments
POST /api/v1/ai-governance/assessments/:id/submit
POST /api/v1/ai-governance/assessments/:id/approve
POST /api/v1/ai-governance/assessments/:id/require-mitigation
POST /api/v1/ai-governance/assessments/:id/approvals
POST /api/v1/ai-governance/approvals/:id/approve
POST /api/v1/ai-governance/approvals/:id/reject
GET  /api/v1/ai-governance/systems/:id/signals
POST /api/v1/ai-governance/systems/:id/signals
GET  /api/v1/ai-governance/incidents
POST /api/v1/ai-governance/systems/:id/incidents
POST /api/v1/ai-governance/incidents/:id/mitigate
POST /api/v1/ai-governance/incidents/:id/close
GET  /api/v1/ai-governance/metrics
```

## Seed

```powershell
npm run seed:ai-governance
```
