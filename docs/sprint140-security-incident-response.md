# Sprint 140 - Security Incident Response

Apply this patch over Sprint 139.

## Endpoints to wire

```text
GET  /api/v1/security-incidents/incidents
POST /api/v1/security-incidents/incidents
POST /api/v1/security-incidents/incidents/:id/transition
POST /api/v1/security-incidents/incidents/:id/start-investigation
POST /api/v1/security-incidents/incidents/:id/tasks
GET  /api/v1/security-incidents/tasks
POST /api/v1/security-incidents/tasks/:id/complete
POST /api/v1/security-incidents/incidents/:id/evidence
GET  /api/v1/security-incidents/incidents/:id/evidence
POST /api/v1/security-incidents/incidents/:id/communications
POST /api/v1/security-incidents/communications/:id/approve
POST /api/v1/security-incidents/communications/:id/send
POST /api/v1/security-incidents/incidents/:id/reviews
POST /api/v1/security-incidents/reviews/:id/complete
POST /api/v1/security-incidents/incidents/:id/actions
POST /api/v1/security-incidents/actions/:id/complete
POST /api/v1/security-incidents/actions/:id/accept-risk
GET  /api/v1/security-incidents/metrics
```

## Seed

```powershell
npm run seed:security-incident-response
```
