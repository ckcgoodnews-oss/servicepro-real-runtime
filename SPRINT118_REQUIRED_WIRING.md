# Sprint 118 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const auditReadiness = require('./routes/auditReadiness');
```

Protect audit readiness endpoints with:

```js
PERMISSIONS.AUDIT_READINESS_READ
PERMISSIONS.AUDIT_READINESS_WRITE
```

Routes are listed in `docs/sprint118-audit-readiness.md`.
