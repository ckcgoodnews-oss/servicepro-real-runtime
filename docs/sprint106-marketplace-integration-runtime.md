# Sprint 106 - Marketplace and Integration Runtime

Apply this patch over Sprint 105.

## Endpoints to wire

```text
GET  /api/v1/marketplace/catalog
POST /api/v1/marketplace/catalog
GET  /api/v1/marketplace/installations
POST /api/v1/marketplace/installations
POST /api/v1/marketplace/installations/:id/connect
POST /api/v1/marketplace/installations/:id/fail
GET  /api/v1/marketplace/installations/:id/health

GET  /api/v1/marketplace/webhooks
POST /api/v1/marketplace/webhooks
GET  /api/v1/marketplace/sync-runs
POST /api/v1/marketplace/sync-runs
POST /api/v1/marketplace/sync-runs/:id/start
POST /api/v1/marketplace/sync-runs/:id/complete

GET  /api/v1/marketplace/summary
```

## Seed

```powershell
npm run seed:marketplace
```
