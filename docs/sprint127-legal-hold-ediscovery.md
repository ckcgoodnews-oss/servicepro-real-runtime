# Sprint 127 - Legal Hold and eDiscovery

Apply this patch over Sprint 126.

## Endpoints to wire

```text
GET  /api/v1/legal-hold/matters
POST /api/v1/legal-hold/matters
POST /api/v1/legal-hold/matters/:id/close
GET  /api/v1/legal-hold/holds
POST /api/v1/legal-hold/matters/:id/holds
POST /api/v1/legal-hold/holds/:id/issue
POST /api/v1/legal-hold/holds/:id/release
GET  /api/v1/legal-hold/holds/:id/custodians
POST /api/v1/legal-hold/holds/:id/custodians
POST /api/v1/legal-hold/custodians/:id/acknowledge
GET  /api/v1/legal-hold/holds/:id/scopes
POST /api/v1/legal-hold/holds/:id/scopes
POST /api/v1/legal-hold/scopes/:id/preserve
POST /api/v1/legal-hold/holds/:id/collections
POST /api/v1/legal-hold/collections/:id/start
POST /api/v1/legal-hold/collections/:id/complete
POST /api/v1/legal-hold/matters/:id/exports
POST /api/v1/legal-hold/exports/:id/start
POST /api/v1/legal-hold/exports/:id/complete
GET  /api/v1/legal-hold/metrics
```

## Seed

```powershell
npm run seed:legal-hold
```
