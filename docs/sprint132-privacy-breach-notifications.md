# Sprint 132 - Privacy Breach Notifications

Apply this patch over Sprint 131.

## Endpoints to wire

```text
GET  /api/v1/privacy-breach/incidents
POST /api/v1/privacy-breach/incidents
POST /api/v1/privacy-breach/incidents/:id/transition
GET  /api/v1/privacy-breach/incidents/:id/assessments
POST /api/v1/privacy-breach/incidents/:id/assessments
POST /api/v1/privacy-breach/assessments/:id/submit
POST /api/v1/privacy-breach/assessments/:id/approve
GET  /api/v1/privacy-breach/obligations
POST /api/v1/privacy-breach/incidents/:id/obligations
POST /api/v1/privacy-breach/obligations/:id/complete
POST /api/v1/privacy-breach/obligations/:id/waive
POST /api/v1/privacy-breach/obligations/mark-overdue
POST /api/v1/privacy-breach/incidents/:id/notices
POST /api/v1/privacy-breach/notices/:id/approve
POST /api/v1/privacy-breach/notices/:id/send
POST /api/v1/privacy-breach/notices/:id/fail
GET  /api/v1/privacy-breach/incidents/:id/evidence
POST /api/v1/privacy-breach/incidents/:id/evidence
GET  /api/v1/privacy-breach/metrics
```

## Seed

```powershell
npm run seed:privacy-breach
```
