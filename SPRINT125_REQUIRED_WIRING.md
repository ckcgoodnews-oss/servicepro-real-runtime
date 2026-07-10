# Sprint 125 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const evidenceFulfillment = require('./routes/evidenceFulfillment');
```

Protect evidence fulfillment endpoints with:

```js
PERMISSIONS.EVIDENCE_FULFILLMENT_READ
PERMISSIONS.EVIDENCE_FULFILLMENT_WRITE
```

Routes are listed in `docs/sprint125-evidence-fulfillment.md`.
