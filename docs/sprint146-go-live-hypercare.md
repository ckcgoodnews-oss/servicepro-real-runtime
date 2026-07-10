# Sprint 146 - Go-Live and Hypercare

Apply this patch over Sprint 145 RC1.

## Endpoints to wire

```text
POST /api/v1/go-live/checklist
POST /api/v1/go-live/checklist/:id/complete
POST /api/v1/go-live/checklist/:id/waive
POST /api/v1/go-live/cutovers
POST /api/v1/go-live/cutovers/:id/approve
POST /api/v1/go-live/cutovers/:id/start
POST /api/v1/go-live/cutovers/:id/complete
POST /api/v1/go-live/cutovers/:id/rollback
POST /api/v1/go-live/cutovers/:id/steps
POST /api/v1/go-live/steps/:id/start
POST /api/v1/go-live/steps/:id/complete
POST /api/v1/go-live/dns
POST /api/v1/go-live/dns/:id/validate
POST /api/v1/go-live/dns/:id/start-propagation
POST /api/v1/go-live/dns/:id/complete
POST /api/v1/go-live/communications
POST /api/v1/go-live/communications/:id/approve
POST /api/v1/go-live/communications/:id/send
POST /api/v1/go-live/rollback-decisions
POST /api/v1/go-live/rollback-decisions/:id/recommend
POST /api/v1/go-live/rollback-decisions/:id/approve
POST /api/v1/go-live/rollback-decisions/:id/execute
POST /api/v1/go-live/hypercare/issues
POST /api/v1/go-live/hypercare/issues/:id/resolve
POST /api/v1/go-live/hypercare/issues/:id/close
POST /api/v1/go-live/hypercare/reports
POST /api/v1/go-live/hypercare/reports/:id/publish
GET  /api/v1/go-live/ready
GET  /api/v1/go-live/metrics
```

## Seed

```powershell
npm run seed:go-live
```
