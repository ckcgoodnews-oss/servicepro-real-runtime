# Sprint 137 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const bcdrGovernance = require('./routes/bcdrGovernance');
```

Protect BCDR governance endpoints with:

```js
PERMISSIONS.BCDR_GOVERNANCE_READ
PERMISSIONS.BCDR_GOVERNANCE_WRITE
```

Routes are listed in `docs/sprint137-bcdr-governance.md`.
