# Sprint 94 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const aiDispatch = require('./routes/aiDispatch');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/ai-dispatch/requests' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_READ)(req, res)) return;
  return aiDispatch.listRequests(req, res);
}
if (req.url === '/api/v1/ai-dispatch/requests' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_WRITE)(req, res)) return;
  return aiDispatch.createRequest(req, res);
}
if (req.url === '/api/v1/ai-dispatch/recommendations' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_READ)(req, res)) return;
  return aiDispatch.listRecommendations(req, res);
}
if (req.url === '/api/v1/ai-dispatch/recommendations/generate' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_WRITE)(req, res)) return;
  return aiDispatch.generateRecommendation(req, res);
}
const aiDispatchAcceptMatch = req.url.match(/^\/api\/v1\/ai-dispatch\/recommendations\/([^/]+)\/accept$/);
if (aiDispatchAcceptMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_WRITE)(req, res)) return;
  return aiDispatch.acceptRecommendation(req, res, aiDispatchAcceptMatch[1]);
}
const aiDispatchRejectMatch = req.url.match(/^\/api\/v1\/ai-dispatch\/recommendations\/([^/]+)\/reject$/);
if (aiDispatchRejectMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_WRITE)(req, res)) return;
  return aiDispatch.rejectRecommendation(req, res, aiDispatchRejectMatch[1]);
}
const aiDispatchRecMatch = req.url.match(/^\/api\/v1\/ai-dispatch\/recommendations\/([^/]+)$/);
if (aiDispatchRecMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.AI_DISPATCH_READ)(req, res)) return;
  return aiDispatch.getRecommendation(req, res, aiDispatchRecMatch[1]);
}
```
