# Sprint 114 - Security Incident Response

Apply this patch over Sprint 113.

## Endpoints to wire

```text
GET  /api/v1/security-incidents
POST /api/v1/security-incidents
POST /api/v1/security-incidents/:id/transition
GET  /api/v1/security-incidents/:id/tasks
POST /api/v1/security-incidents/:id/tasks
POST /api/v1/security-incidents/tasks/:id/complete
GET  /api/v1/security-incidents/:id/evidence
POST /api/v1/security-incidents/:id/evidence
POST /api/v1/security-incidents/evidence/:id/custody
GET  /api/v1/security-incidents/:id/notifications
POST /api/v1/security-incidents/:id/notifications
POST /api/v1/security-incidents/notifications/:id/send
POST /api/v1/security-incidents/notifications/:id/fail
GET  /api/v1/security-incidents/:id/postmortems
POST /api/v1/security-incidents/:id/postmortems
POST /api/v1/security-incidents/postmortems/:id/approve
POST /api/v1/security-incidents/postmortems/:id/publish
GET  /api/v1/security-incidents/metrics
```

## Seed

```powershell
npm run seed:security-incidents
```
