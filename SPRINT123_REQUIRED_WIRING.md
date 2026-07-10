# Sprint 123 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const trustCenter = require('./routes/trustCenter');
```

Protect trust center endpoints with:

```js
PERMISSIONS.TRUST_CENTER_READ
PERMISSIONS.TRUST_CENTER_WRITE
```

Routes are listed in `docs/sprint123-trust-center.md`.
