# Sprint 85 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const timeTracking = require('./routes/timeTracking');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/time-entries' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TIME_ENTRIES_READ)(req, res)) return;
  return timeTracking.list(req, res);
}
if (req.url === '/api/v1/time-entries' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TIME_ENTRIES_WRITE)(req, res)) return;
  return timeTracking.create(req, res);
}
if (req.url === '/api/v1/time-entries/summary' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TIME_ENTRIES_READ)(req, res)) return;
  return timeTracking.summary(req, res);
}
const timeClockOutMatch = req.url.match(/^\/api\/v1\/time-entries\/([^/]+)\/clock-out$/);
if (timeClockOutMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TIME_ENTRIES_WRITE)(req, res)) return;
  return timeTracking.clockOut(req, res, timeClockOutMatch[1]);
}
const timeApproveMatch = req.url.match(/^\/api\/v1\/time-entries\/([^/]+)\/approve$/);
if (timeApproveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TIME_ENTRIES_APPROVE)(req, res)) return;
  return timeTracking.approve(req, res, timeApproveMatch[1]);
}
const timeEntryMatch = req.url.match(/^\/api\/v1\/time-entries\/([^/]+)$/);
if (timeEntryMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TIME_ENTRIES_READ)(req, res)) return;
  return timeTracking.get(req, res, timeEntryMatch[1]);
}
```
