# Sprint 126 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const dataResidency = require('./routes/dataResidency');
```

Protect data residency endpoints with:

```js
PERMISSIONS.DATA_RESIDENCY_READ
PERMISSIONS.DATA_RESIDENCY_WRITE
```

Routes are listed in `docs/sprint126-data-residency.md`.
