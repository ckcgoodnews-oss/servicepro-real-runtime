# Sprint 100 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const operations = require('./routes/operations');
```

Add routes for:

```text
/api/v1/operations/environments
/api/v1/operations/releases
/api/v1/operations/releases/:id/approve
/api/v1/operations/releases/:id/deploy
/api/v1/operations/releases/:id/rollback
/api/v1/operations/health-checks
/api/v1/operations/health-checks/defaults
/api/v1/operations/readiness
/api/v1/operations/runbook
```

Use `PERMISSIONS.OPERATIONS_READ` for read/readiness routes and `PERMISSIONS.OPERATIONS_WRITE` for create, approve, deploy, rollback, and health-check writes.
