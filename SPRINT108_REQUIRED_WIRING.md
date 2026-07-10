# Sprint 108 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const support = require('./routes/support');
```

Protect support endpoints with:

```js
PERMISSIONS.SUPPORT_READ
PERMISSIONS.SUPPORT_WRITE
```

Routes are listed in `docs/sprint108-support-operations-runtime.md`.
