# Sprint 147 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const customerSuccessOnboarding = require('./routes/customerSuccessOnboarding');
```

Protect customer success endpoints with:

```js
PERMISSIONS.CUSTOMER_SUCCESS_READ
PERMISSIONS.CUSTOMER_SUCCESS_WRITE
```

Routes are listed in `docs/sprint147-customer-success-onboarding.md`.
