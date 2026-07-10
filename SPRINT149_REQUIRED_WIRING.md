# Sprint 149 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const financeRevenueOps = require('./routes/financeRevenueOps');
```

Protect finance endpoints with:

```js
PERMISSIONS.FINANCE_READ
PERMISSIONS.FINANCE_WRITE
```

Routes are listed in `docs/sprint149-finance-revenue-ops.md`.
