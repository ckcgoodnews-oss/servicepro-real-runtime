# Sprint 89 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const sla = require('./routes/sla');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/sla/policies' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.SLA_READ)(req, res)) return;
  return sla.listPolicies(req, res);
}
if (req.url === '/api/v1/sla/policies' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_WRITE)(req, res)) return;
  return sla.createPolicy(req, res);
}
if (req.url === '/api/v1/sla/timers' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.SLA_READ)(req, res)) return;
  return sla.listTimers(req, res);
}
if (req.url === '/api/v1/sla/timers' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_WRITE)(req, res)) return;
  return sla.createTimer(req, res);
}
if (req.url === '/api/v1/sla/evaluate' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_READ)(req, res)) return;
  return sla.evaluate(req, res);
}
if (req.url === '/api/v1/sla/mark-breaches' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_WRITE)(req, res)) return;
  return sla.markBreaches(req, res);
}
const slaPolicyStartMatch = req.url.match(/^\/api\/v1\/sla\/policies\/([^/]+)\/start$/);
if (slaPolicyStartMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_WRITE)(req, res)) return;
  return sla.createTimerFromPolicy(req, res, slaPolicyStartMatch[1]);
}
const slaRespondedMatch = req.url.match(/^\/api\/v1\/sla\/timers\/([^/]+)\/responded$/);
if (slaRespondedMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_WRITE)(req, res)) return;
  return sla.markResponded(req, res, slaRespondedMatch[1]);
}
const slaResolvedMatch = req.url.match(/^\/api\/v1\/sla\/timers\/([^/]+)\/resolved$/);
if (slaResolvedMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SLA_WRITE)(req, res)) return;
  return sla.markResolved(req, res, slaResolvedMatch[1]);
}
```
