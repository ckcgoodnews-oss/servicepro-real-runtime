# Sprint 138 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const assetConfigCompliance = require('./routes/assetConfigCompliance');
```

Protect asset configuration endpoints with:

```js
PERMISSIONS.ASSET_CONFIG_READ
PERMISSIONS.ASSET_CONFIG_WRITE
```

Routes are listed in `docs/sprint138-asset-config-compliance.md`.
