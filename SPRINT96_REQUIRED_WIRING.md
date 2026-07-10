# Sprint 96 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const communicationCenter = require('./routes/communicationCenter');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/communication-center/threads' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_READ)(req, res)) return;
  return communicationCenter.listThreads(req, res);
}
if (req.url === '/api/v1/communication-center/threads' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_WRITE)(req, res)) return;
  return communicationCenter.createThread(req, res);
}
if (req.url === '/api/v1/communication-center/summary' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_READ)(req, res)) return;
  return communicationCenter.summary(req, res);
}
const ccMessagesMatch = req.url.match(/^\/api\/v1\/communication-center\/threads\/([^/]+)\/messages$/);
if (ccMessagesMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_READ)(req, res)) return;
  return communicationCenter.listMessages(req, res, ccMessagesMatch[1]);
}
if (ccMessagesMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_WRITE)(req, res)) return;
  return communicationCenter.createMessage(req, res, ccMessagesMatch[1]);
}
const ccAssignMatch = req.url.match(/^\/api\/v1\/communication-center\/threads\/([^/]+)\/assign$/);
if (ccAssignMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_WRITE)(req, res)) return;
  return communicationCenter.assignThread(req, res, ccAssignMatch[1]);
}
const ccReadMatch = req.url.match(/^\/api\/v1\/communication-center\/threads\/([^/]+)\/mark-read$/);
if (ccReadMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_WRITE)(req, res)) return;
  return communicationCenter.markRead(req, res, ccReadMatch[1]);
}
const ccResolveMatch = req.url.match(/^\/api\/v1\/communication-center\/threads\/([^/]+)\/resolve$/);
if (ccResolveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_WRITE)(req, res)) return;
  return communicationCenter.resolveThread(req, res, ccResolveMatch[1]);
}
const ccThreadMatch = req.url.match(/^\/api\/v1\/communication-center\/threads\/([^/]+)$/);
if (ccThreadMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_READ)(req, res)) return;
  return communicationCenter.getThread(req, res, ccThreadMatch[1]);
}
if (ccThreadMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.COMMUNICATION_CENTER_WRITE)(req, res)) return;
  return communicationCenter.updateThread(req, res, ccThreadMatch[1]);
}
```
