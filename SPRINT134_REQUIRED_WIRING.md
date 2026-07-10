# Sprint 134 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const policyLifecycle = require('./routes/policyLifecycle');
```

Protect policy lifecycle endpoints with:

```js
PERMISSIONS.POLICY_LIFECYCLE_READ
PERMISSIONS.POLICY_LIFECYCLE_WRITE
```

Routes are listed in `docs/sprint134-policy-lifecycle-attestations.md`.
