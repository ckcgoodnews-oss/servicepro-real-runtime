# Sprint 132 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const privacyBreach = require('./routes/privacyBreach');
```

Protect privacy breach endpoints with:

```js
PERMISSIONS.PRIVACY_BREACH_READ
PERMISSIONS.PRIVACY_BREACH_WRITE
```

Routes are listed in `docs/sprint132-privacy-breach-notifications.md`.
