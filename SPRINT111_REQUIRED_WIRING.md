# Sprint 111 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const documents = require('./routes/documents');
```

Protect document endpoints with:

```js
PERMISSIONS.DOCUMENTS_READ
PERMISSIONS.DOCUMENTS_WRITE
```

Routes are listed in `docs/sprint111-document-esign-runtime.md`.
