# Sprint 136 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const vendorRisk = require('./routes/vendorRisk');
```

Protect vendor risk endpoints with:

```js
PERMISSIONS.VENDOR_RISK_READ
PERMISSIONS.VENDOR_RISK_WRITE
```

Routes are listed in `docs/sprint136-vendor-risk.md`.
