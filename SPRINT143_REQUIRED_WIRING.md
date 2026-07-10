# Sprint 143 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const soarAutomation = require('./routes/soarAutomation');
```

Protect SOAR endpoints with:

```js
PERMISSIONS.SOAR_AUTOMATION_READ
PERMISSIONS.SOAR_AUTOMATION_WRITE
```

Routes are listed in `docs/sprint143-soar-automation.md`.
