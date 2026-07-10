# Sprint 148 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const billingMonetization = require('./routes/billingMonetization');
```

Protect billing endpoints with:

```js
PERMISSIONS.BILLING_READ
PERMISSIONS.BILLING_WRITE
```

Routes are listed in `docs/sprint148-billing-monetization.md`.
