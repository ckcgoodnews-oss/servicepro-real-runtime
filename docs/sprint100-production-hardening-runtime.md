# Sprint 100 - Production Hardening Runtime

Apply this patch over Sprint 99.

## Endpoints to wire

```text
GET  /api/v1/operations/environments
POST /api/v1/operations/environments
GET  /api/v1/operations/releases
POST /api/v1/operations/releases
POST /api/v1/operations/releases/:id/approve
POST /api/v1/operations/releases/:id/deploy
POST /api/v1/operations/releases/:id/rollback
GET  /api/v1/operations/health-checks
POST /api/v1/operations/health-checks
POST /api/v1/operations/health-checks/defaults
POST /api/v1/operations/readiness
GET  /api/v1/operations/runbook
POST /api/v1/operations/runbook
```

## Seed

```powershell
npm run seed:operations
```

## Readiness

```powershell
npm run operations:readiness
```
