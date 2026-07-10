# Sprint 93 - Reputation Runtime

Apply this patch over Sprint 92.

## Endpoints to wire

```text
GET  /api/v1/reputation/sites
POST /api/v1/reputation/sites

GET  /api/v1/reputation/campaigns
POST /api/v1/reputation/campaigns

GET  /api/v1/reputation/requests
POST /api/v1/reputation/requests
POST /api/v1/reputation/requests/:id/mark-sent

GET  /api/v1/reputation/captures
POST /api/v1/reputation/captures
POST /api/v1/reputation/captures/:id/respond
POST /api/v1/reputation/captures/:id/escalate

POST /api/v1/reputation/summary
```

## Seed

```powershell
npm run seed:reputation
```
