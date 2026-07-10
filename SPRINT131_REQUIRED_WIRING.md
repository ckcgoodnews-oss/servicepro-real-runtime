# Sprint 131 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const processingInventory = require('./routes/processingInventory');
```

Protect processing inventory endpoints with:

```js
PERMISSIONS.PROCESSING_INVENTORY_READ
PERMISSIONS.PROCESSING_INVENTORY_WRITE
```

Routes are listed in `docs/sprint131-processing-inventory-dpia.md`.
