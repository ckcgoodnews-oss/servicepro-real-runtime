# Sprint 113 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const privacy = require('./routes/privacy');
```

Protect privacy endpoints with:

```js
PERMISSIONS.PRIVACY_READ
PERMISSIONS.PRIVACY_WRITE
```

Routes are listed in `docs/sprint113-privacy-automation.md`.
