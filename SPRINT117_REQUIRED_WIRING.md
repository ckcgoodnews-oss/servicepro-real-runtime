# Sprint 117 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const complianceControls = require('./routes/complianceControls');
```

Protect compliance control endpoints with:

```js
PERMISSIONS.COMPLIANCE_CONTROLS_READ
PERMISSIONS.COMPLIANCE_CONTROLS_WRITE
```

Routes are listed in `docs/sprint117-compliance-controls.md`.
