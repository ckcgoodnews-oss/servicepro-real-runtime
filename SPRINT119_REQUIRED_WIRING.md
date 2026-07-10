# Sprint 119 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const controlMonitoring = require('./routes/controlMonitoring');
```

Protect control monitoring endpoints with:

```js
PERMISSIONS.CONTROL_MONITORING_READ
PERMISSIONS.CONTROL_MONITORING_WRITE
```

Routes are listed in `docs/sprint119-continuous-control-monitoring.md`.
