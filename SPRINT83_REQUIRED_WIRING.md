# Sprint 83 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const communications = require('./routes/communications');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/communications' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_READ)(req, res)) return;
  return communications.list(req, res);
}
if (req.url === '/api/v1/communications' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_WRITE)(req, res)) return;
  return communications.create(req, res);
}
if (req.url === '/api/v1/communications/timeline' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_READ)(req, res)) return;
  return communications.timeline(req, res);
}
const customerCommsTimelineMatch = req.url.match(/^\/api\/v1\/customers\/([^/]+)\/communications\/timeline$/);
if (customerCommsTimelineMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_READ)(req, res)) return;
  return communications.timelineForCustomer(req, res, customerCommsTimelineMatch[1]);
}
const customerCommsMatch = req.url.match(/^\/api\/v1\/customers\/([^/]+)\/communications$/);
if (customerCommsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_READ)(req, res)) return;
  return communications.listForCustomer(req, res, customerCommsMatch[1]);
}
const commStatusMatch = req.url.match(/^\/api\/v1\/communications\/([^/]+)\/status$/);
if (commStatusMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_WRITE)(req, res)) return;
  return communications.updateStatus(req, res, commStatusMatch[1]);
}
const commMatch = req.url.match(/^\/api\/v1\/communications\/([^/]+)$/);
if (commMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATIONS_READ)(req, res)) return;
  return communications.get(req, res, commMatch[1]);
}
```
