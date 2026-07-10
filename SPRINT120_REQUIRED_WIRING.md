# Sprint 120 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const operationalRisks = require('./routes/operationalRisks');
```

Protect operational risk endpoints with:

```js
PERMISSIONS.OPERATIONAL_RISKS_READ
PERMISSIONS.OPERATIONAL_RISKS_WRITE
```

Routes are listed in `docs/sprint120-operational-risk-register.md`.
