# Sprint 144 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const governanceReporting = require('./routes/governanceReporting');
```

Protect governance reporting endpoints with:

```js
PERMISSIONS.GOVERNANCE_REPORTING_READ
PERMISSIONS.GOVERNANCE_REPORTING_WRITE
```

Routes are listed in `docs/sprint144-governance-reporting.md`.
