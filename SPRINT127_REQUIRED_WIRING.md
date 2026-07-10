# Sprint 127 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const legalHold = require('./routes/legalHold');
```

Protect legal hold endpoints with:

```js
PERMISSIONS.LEGAL_HOLD_READ
PERMISSIONS.LEGAL_HOLD_WRITE
```

Routes are listed in `docs/sprint127-legal-hold-ediscovery.md`.
