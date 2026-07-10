# Sprint 106 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const marketplace = require('./routes/marketplace');
```

Protect marketplace endpoints with:

```js
PERMISSIONS.MARKETPLACE_READ
PERMISSIONS.MARKETPLACE_WRITE
```

Routes are listed in `docs/sprint106-marketplace-integration-runtime.md`.
