# Sprint 128 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const dataRetention = require('./routes/dataRetention');
```

Protect data retention endpoints with:

```js
PERMISSIONS.DATA_RETENTION_READ
PERMISSIONS.DATA_RETENTION_WRITE
```

Routes are listed in `docs/sprint128-data-retention-lifecycle.md`.
