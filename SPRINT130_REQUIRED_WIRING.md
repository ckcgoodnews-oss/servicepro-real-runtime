# Sprint 130 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const consentPreferences = require('./routes/consentPreferences');
```

Protect consent preference endpoints with:

```js
PERMISSIONS.CONSENT_PREFERENCES_READ
PERMISSIONS.CONSENT_PREFERENCES_WRITE
```

Routes are listed in `docs/sprint130-consent-preferences.md`.
