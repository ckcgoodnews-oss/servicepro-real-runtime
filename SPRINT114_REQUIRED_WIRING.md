# Sprint 114 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const securityIncidents = require('./routes/securityIncidents');
```

Protect security incident endpoints with:

```js
PERMISSIONS.SECURITY_INCIDENTS_READ
PERMISSIONS.SECURITY_INCIDENTS_WRITE
```

Routes are listed in `docs/sprint114-security-incident-response.md`.
