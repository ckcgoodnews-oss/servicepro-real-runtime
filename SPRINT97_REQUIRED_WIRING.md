# Sprint 97 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const mobileSync = require('./routes/mobileSync');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/mobile-sync/devices' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_READ)(req, res)) return;
  return mobileSync.listDevices(req, res);
}
if (req.url === '/api/v1/mobile-sync/devices' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_WRITE)(req, res)) return;
  return mobileSync.registerDevice(req, res);
}
if (req.url === '/api/v1/mobile-sync/push' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_WRITE)(req, res)) return;
  return mobileSync.pushChanges(req, res);
}
if (req.url === '/api/v1/mobile-sync/pull' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_READ)(req, res)) return;
  return mobileSync.pullPackage(req, res);
}
if (req.url === '/api/v1/mobile-sync/changes' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_READ)(req, res)) return;
  return mobileSync.listChanges(req, res);
}
const mobileHeartbeatMatch = req.url.match(/^\/api\/v1\/mobile-sync\/devices\/([^/]+)\/heartbeat$/);
if (mobileHeartbeatMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_WRITE)(req, res)) return;
  return mobileSync.heartbeat(req, res, mobileHeartbeatMatch[1]);
}
const mobileCursorMatch = req.url.match(/^\/api\/v1\/mobile-sync\/devices\/([^/]+)\/cursor$/);
if (mobileCursorMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_READ)(req, res)) return;
  return mobileSync.getCursor(req, res, mobileCursorMatch[1]);
}
const mobileResolveMatch = req.url.match(/^\/api\/v1\/mobile-sync\/changes\/([^/]+)\/resolve$/);
if (mobileResolveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MOBILE_SYNC_WRITE)(req, res)) return;
  return mobileSync.resolveConflict(req, res, mobileResolveMatch[1]);
}
```
