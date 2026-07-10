# Sprint 145 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const productionRc1 = require('./routes/productionRc1');
```

Protect production RC1 endpoints with:

```js
PERMISSIONS.PRODUCTION_RC1_READ
PERMISSIONS.PRODUCTION_RC1_WRITE
```

Routes are listed in `docs/sprint145-production-rc1.md`.
