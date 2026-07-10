# Sprint 109 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const customerSuccess = require('./routes/customerSuccess');
```

Protect customer success endpoints with:

```js
PERMISSIONS.CUSTOMER_SUCCESS_READ
PERMISSIONS.CUSTOMER_SUCCESS_WRITE
```

Routes are listed in `docs/sprint109-customer-success-runtime.md`.
