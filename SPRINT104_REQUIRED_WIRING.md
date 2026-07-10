# Sprint 104 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const observability = require('./routes/observability');
```

Add the routes listed in `docs/sprint104-observability-incident-runtime.md`, protected with:

```js
PERMISSIONS.OBSERVABILITY_READ
PERMISSIONS.OBSERVABILITY_WRITE
```
