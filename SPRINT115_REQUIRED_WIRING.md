# Sprint 115 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const vulnerabilities = require('./routes/vulnerabilities');
```

Protect vulnerability endpoints with:

```js
PERMISSIONS.VULNERABILITIES_READ
PERMISSIONS.VULNERABILITIES_WRITE
```

Routes are listed in `docs/sprint115-vulnerability-management.md`.
