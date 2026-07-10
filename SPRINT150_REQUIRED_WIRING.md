# Sprint 150 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const enterpriseAuditCompliance = require('./routes/enterpriseAuditCompliance');
```

Protect audit compliance endpoints with:

```js
PERMISSIONS.AUDIT_COMPLIANCE_READ
PERMISSIONS.AUDIT_COMPLIANCE_WRITE
```

Routes are listed in `docs/sprint150-enterprise-audit-compliance.md`.
