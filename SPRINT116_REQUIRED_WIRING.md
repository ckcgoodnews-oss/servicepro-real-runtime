# Sprint 116 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const thirdPartyRisk = require('./routes/thirdPartyRisk');
```

Protect third-party risk endpoints with:

```js
PERMISSIONS.THIRD_PARTY_RISK_READ
PERMISSIONS.THIRD_PARTY_RISK_WRITE
```

Routes are listed in `docs/sprint116-third-party-risk.md`.
