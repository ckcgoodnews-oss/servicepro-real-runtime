# Sprint 139 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const vulnerabilityManagement = require('./routes/vulnerabilityManagement');
```

Protect vulnerability management endpoints with:

```js
PERMISSIONS.VULNERABILITY_MANAGEMENT_READ
PERMISSIONS.VULNERABILITY_MANAGEMENT_WRITE
```

Routes are listed in `docs/sprint139-vulnerability-management.md`.
