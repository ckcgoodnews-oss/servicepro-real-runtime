# Sprint 91 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const warranty = require('./routes/warranty');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/warranty/policies' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WARRANTY_READ)(req, res)) return;
  return warranty.listPolicies(req, res);
}
if (req.url === '/api/v1/warranty/policies' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_WRITE)(req, res)) return;
  return warranty.createPolicy(req, res);
}
if (req.url === '/api/v1/warranty/claims' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WARRANTY_READ)(req, res)) return;
  return warranty.listClaims(req, res);
}
if (req.url === '/api/v1/warranty/claims' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_WRITE)(req, res)) return;
  return warranty.createClaim(req, res);
}
if (req.url === '/api/v1/warranty/claims/evaluate' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_READ)(req, res)) return;
  return warranty.evaluateEligibility(req, res);
}
const warrantyApproveMatch = req.url.match(/^\/api\/v1\/warranty\/claims\/([^/]+)\/approve$/);
if (warrantyApproveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_WRITE)(req, res)) return;
  return warranty.approveClaim(req, res, warrantyApproveMatch[1]);
}
const warrantyDenyMatch = req.url.match(/^\/api\/v1\/warranty\/claims\/([^/]+)\/deny$/);
if (warrantyDenyMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_WRITE)(req, res)) return;
  return warranty.denyClaim(req, res, warrantyDenyMatch[1]);
}
if (req.url === '/api/v1/callbacks' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WARRANTY_READ)(req, res)) return;
  return warranty.listCallbacks(req, res);
}
if (req.url === '/api/v1/callbacks' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_WRITE)(req, res)) return;
  return warranty.createCallback(req, res);
}
const callbackCompleteMatch = req.url.match(/^\/api\/v1\/callbacks\/([^/]+)\/complete$/);
if (callbackCompleteMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WARRANTY_WRITE)(req, res)) return;
  return warranty.completeCallback(req, res, callbackCompleteMatch[1]);
}
```
