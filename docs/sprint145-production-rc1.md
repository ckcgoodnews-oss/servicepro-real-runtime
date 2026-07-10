# Sprint 145 - Production Hardening and Release Candidate 1

Apply this patch over Sprint 144.

## Endpoints to wire

```text
POST /api/v1/production-rc1/health-checks
POST /api/v1/production-rc1/health-checks/:id/result
POST /api/v1/production-rc1/readiness-checks
POST /api/v1/production-rc1/readiness-checks/:id/ready
POST /api/v1/production-rc1/readiness-checks/:id/block
POST /api/v1/production-rc1/release-gates
POST /api/v1/production-rc1/release-gates/:id/pass
POST /api/v1/production-rc1/release-gates/:id/fail
POST /api/v1/production-rc1/release-gates/:id/waive
POST /api/v1/production-rc1/deployments
POST /api/v1/production-rc1/deployments/:id/start
POST /api/v1/production-rc1/deployments/:id/complete
POST /api/v1/production-rc1/deployments/:id/rollback
POST /api/v1/production-rc1/backups
POST /api/v1/production-rc1/backups/:id/verify
POST /api/v1/production-rc1/backups/:id/fail
POST /api/v1/production-rc1/runbooks
POST /api/v1/production-rc1/runbooks/:id/activate
POST /api/v1/production-rc1/evidence
POST /api/v1/production-rc1/evidence/:id/verify
GET  /api/v1/production-rc1/release-ready
GET  /api/v1/production-rc1/metrics
```

## Seed

```powershell
npm run seed:production-rc1
```

## RC1 acceptance

Release readiness requires:
- all required readiness checks are ready or waived
- all required release gates are passed or waived
- health checks are healthy or degraded
- at least one verified restore-tested backup exists
