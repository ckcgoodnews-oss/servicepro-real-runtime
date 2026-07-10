# Sprint 105 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const subscription = require('./routes/subscription');
```

Protect the subscription endpoints with:

```js
PERMISSIONS.SUBSCRIPTION_READ
PERMISSIONS.SUBSCRIPTION_WRITE
```

Routes are listed in `docs/sprint105-subscription-entitlement-runtime.md`.
