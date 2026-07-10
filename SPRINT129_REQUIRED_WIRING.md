# Sprint 129 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const privacyRights = require('./routes/privacyRights');
```

Protect privacy rights endpoints with:

```js
PERMISSIONS.PRIVACY_RIGHTS_READ
PERMISSIONS.PRIVACY_RIGHTS_WRITE
```

Routes are listed in `docs/sprint129-privacy-rights-dsar.md`.
