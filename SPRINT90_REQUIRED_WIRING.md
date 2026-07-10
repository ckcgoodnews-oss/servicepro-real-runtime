# Sprint 90 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const qaInspections = require('./routes/qaInspections');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/qa/templates' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.QA_READ)(req, res)) return;
  return qaInspections.listTemplates(req, res);
}
if (req.url === '/api/v1/qa/templates' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.QA_WRITE)(req, res)) return;
  return qaInspections.createTemplate(req, res);
}
if (req.url === '/api/v1/qa/inspections' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.QA_READ)(req, res)) return;
  return qaInspections.listInspections(req, res);
}
const qaCreateMatch = req.url.match(/^\/api\/v1\/qa\/templates\/([^/]+)\/create-inspection$/);
if (qaCreateMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.QA_WRITE)(req, res)) return;
  return qaInspections.createFromTemplate(req, res, qaCreateMatch[1]);
}
const qaItemMatch = req.url.match(/^\/api\/v1\/qa\/inspections\/([^/]+)\/items\/([^/]+)$/);
if (qaItemMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.QA_WRITE)(req, res)) return;
  return qaInspections.updateItem(req, res, qaItemMatch[1], qaItemMatch[2]);
}
const qaCompleteMatch = req.url.match(/^\/api\/v1\/qa\/inspections\/([^/]+)\/complete$/);
if (qaCompleteMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.QA_WRITE)(req, res)) return;
  return qaInspections.complete(req, res, qaCompleteMatch[1]);
}
const qaScoreMatch = req.url.match(/^\/api\/v1\/qa\/inspections\/([^/]+)\/score$/);
if (qaScoreMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.QA_READ)(req, res)) return;
  return qaInspections.score(req, res, qaScoreMatch[1]);
}
const qaInspectionMatch = req.url.match(/^\/api\/v1\/qa\/inspections\/([^/]+)$/);
if (qaInspectionMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.QA_READ)(req, res)) return;
  return qaInspections.getInspection(req, res, qaInspectionMatch[1]);
}
```
