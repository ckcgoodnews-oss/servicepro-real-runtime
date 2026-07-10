# Sprint 107 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const partner = require('./routes/partner');
```

Protect partner endpoints with:

```js
PERMISSIONS.PARTNERS_READ
PERMISSIONS.PARTNERS_WRITE
```

Routes are listed in `docs/sprint107-partner-reseller-runtime.md`.
