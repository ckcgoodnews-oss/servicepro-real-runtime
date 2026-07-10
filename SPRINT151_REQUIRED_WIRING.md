# Sprint 151 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const privacyDsarOps = require('./routes/privacyDsarOps');
```

Protect privacy endpoints with:

```js
PERMISSIONS.PRIVACY_READ
PERMISSIONS.PRIVACY_WRITE
```

Routes are listed in `docs/sprint151-privacy-dsar-ops.md`.
