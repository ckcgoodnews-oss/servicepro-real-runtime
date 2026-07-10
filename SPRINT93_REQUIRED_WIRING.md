# Sprint 93 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const reputation = require('./routes/reputation');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/reputation/sites' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REPUTATION_READ)(req, res)) return;
  return reputation.listSites(req, res);
}
if (req.url === '/api/v1/reputation/sites' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.createSite(req, res);
}
if (req.url === '/api/v1/reputation/campaigns' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REPUTATION_READ)(req, res)) return;
  return reputation.listCampaigns(req, res);
}
if (req.url === '/api/v1/reputation/campaigns' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.createCampaign(req, res);
}
if (req.url === '/api/v1/reputation/requests' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REPUTATION_READ)(req, res)) return;
  return reputation.listRequests(req, res);
}
if (req.url === '/api/v1/reputation/requests' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.createRequest(req, res);
}
const reviewRequestSentMatch = req.url.match(/^\/api\/v1\/reputation\/requests\/([^/]+)\/mark-sent$/);
if (reviewRequestSentMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.markRequestSent(req, res, reviewRequestSentMatch[1]);
}
if (req.url === '/api/v1/reputation/captures' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REPUTATION_READ)(req, res)) return;
  return reputation.listCaptures(req, res);
}
if (req.url === '/api/v1/reputation/captures' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.createCapture(req, res);
}
const reviewRespondMatch = req.url.match(/^\/api\/v1\/reputation\/captures\/([^/]+)\/respond$/);
if (reviewRespondMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.markResponded(req, res, reviewRespondMatch[1]);
}
const reviewEscalateMatch = req.url.match(/^\/api\/v1\/reputation\/captures\/([^/]+)\/escalate$/);
if (reviewEscalateMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_WRITE)(req, res)) return;
  return reputation.escalate(req, res, reviewEscalateMatch[1]);
}
if (req.url === '/api/v1/reputation/summary' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REPUTATION_READ)(req, res)) return;
  return reputation.summary(req, res);
}
```
