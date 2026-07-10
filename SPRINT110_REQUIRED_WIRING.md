# Sprint 110 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const contracts = require('./routes/contracts');
```

Protect contract endpoints with:

```js
PERMISSIONS.CONTRACTS_READ
PERMISSIONS.CONTRACTS_WRITE
```

Routes are listed in `docs/sprint110-contract-management-runtime.md`.
