# Sprint 142 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const siemDetectionEngineering = require('./routes/siemDetectionEngineering');
```

Protect SIEM detection endpoints with:

```js
PERMISSIONS.SIEM_DETECTION_READ
PERMISSIONS.SIEM_DETECTION_WRITE
```

Routes are listed in `docs/sprint142-siem-detection-engineering.md`.
