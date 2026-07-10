# Sprint 146 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const goLiveHypercare = require('./routes/goLiveHypercare');
```

Protect go-live endpoints with:

```js
PERMISSIONS.GO_LIVE_READ
PERMISSIONS.GO_LIVE_WRITE
```

Routes are listed in `docs/sprint146-go-live-hypercare.md`.
