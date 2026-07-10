# Sprint 133 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const aiGovernance = require('./routes/aiGovernance');
```

Protect AI governance endpoints with:

```js
PERMISSIONS.AI_GOVERNANCE_READ
PERMISSIONS.AI_GOVERNANCE_WRITE
```

Routes are listed in `docs/sprint133-ai-governance-model-risk.md`.
