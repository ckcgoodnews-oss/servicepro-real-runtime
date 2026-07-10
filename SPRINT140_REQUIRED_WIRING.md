# Sprint 140 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const securityIncidentResponse = require('./routes/securityIncidentResponse');
```

Protect security incident response endpoints with:

```js
PERMISSIONS.SECURITY_INCIDENT_READ
PERMISSIONS.SECURITY_INCIDENT_WRITE
```

Routes are listed in `docs/sprint140-security-incident-response.md`.
