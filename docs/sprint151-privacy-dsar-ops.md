# Sprint 151 - Privacy Operations and Data Subject Rights

Apply this patch over Sprint 150.

## Endpoints to wire

```text
POST /api/v1/privacy/dsars
POST /api/v1/privacy/dsars/:id/verify
POST /api/v1/privacy/dsars/:id/fulfill
POST /api/v1/privacy/dsars/:id/deny
POST /api/v1/privacy/consents
POST /api/v1/privacy/consents/:id/withdraw
POST /api/v1/privacy/retention-policies
POST /api/v1/privacy/retention-policies/:id/activate
POST /api/v1/privacy/retention-policies/:id/retire
POST /api/v1/privacy/deletion-jobs
POST /api/v1/privacy/deletion-jobs/:id/start
POST /api/v1/privacy/deletion-jobs/:id/complete
POST /api/v1/privacy/deletion-jobs/:id/fail
POST /api/v1/privacy/processing-activities
POST /api/v1/privacy/processing-activities/:id/activate
POST /api/v1/privacy/processing-activities/:id/retire
POST /api/v1/privacy/dpias
POST /api/v1/privacy/dpias/:id/review
POST /api/v1/privacy/dpias/:id/approve
POST /api/v1/privacy/dpias/:id/reject
POST /api/v1/privacy/breaches
POST /api/v1/privacy/breaches/:id/confirm
POST /api/v1/privacy/breaches/:id/report
POST /api/v1/privacy/breaches/:id/notify-subjects
POST /api/v1/privacy/breaches/:id/close
GET  /api/v1/privacy/metrics
```

## Seed

```powershell
npm run seed:privacy
```
