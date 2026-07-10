# Sprint 112 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const retention = require('./routes/retention');
```

Protect retention endpoints with:

```js
PERMISSIONS.RETENTION_READ
PERMISSIONS.RETENTION_WRITE
```

Routes are listed in `docs/sprint112-document-retention-compliance.md`.
