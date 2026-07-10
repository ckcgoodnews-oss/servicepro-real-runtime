# Sprint 101 - Tenant Security Policy Runtime

Apply this patch over Sprint 100.

## Endpoints to wire

```text
GET   /api/v1/tenant-security/policies
POST  /api/v1/tenant-security/policies
GET   /api/v1/tenant-security/policies/:id
PATCH /api/v1/tenant-security/policies/:id

POST /api/v1/tenant-security/evaluate
GET  /api/v1/tenant-security/decisions
GET  /api/v1/tenant-security/summary
```

## Seed

```powershell
npm run seed:tenant-security
```
