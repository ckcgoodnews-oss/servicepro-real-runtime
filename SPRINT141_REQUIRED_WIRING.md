# Sprint 141 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const threatIntelligence = require('./routes/threatIntelligence');
```

Protect threat intelligence endpoints with:

```js
PERMISSIONS.THREAT_INTEL_READ
PERMISSIONS.THREAT_INTEL_WRITE
```

Routes are listed in `docs/sprint141-threat-intelligence.md`.
