# Sprint 124 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const securityQuestionnaires = require('./routes/securityQuestionnaires');
```

Protect security questionnaire endpoints with:

```js
PERMISSIONS.SECURITY_QUESTIONNAIRES_READ
PERMISSIONS.SECURITY_QUESTIONNAIRES_WRITE
```

Routes are listed in `docs/sprint124-security-questionnaires.md`.
