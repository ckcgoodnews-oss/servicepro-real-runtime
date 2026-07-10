# Sprint 135 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const trainingAwareness = require('./routes/trainingAwareness');
```

Protect training awareness endpoints with:

```js
PERMISSIONS.TRAINING_AWARENESS_READ
PERMISSIONS.TRAINING_AWARENESS_WRITE
```

Routes are listed in `docs/sprint135-training-awareness.md`.
