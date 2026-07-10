# Sprint 84 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const reminders = require('./routes/reminders');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/reminder-rules' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REMINDERS_READ)(req, res)) return;
  return reminders.listRules(req, res);
}
if (req.url === '/api/v1/reminder-rules' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_WRITE)(req, res)) return;
  return reminders.createRule(req, res);
}
if (req.url === '/api/v1/follow-ups' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REMINDERS_READ)(req, res)) return;
  return reminders.listFollowUps(req, res);
}
if (req.url === '/api/v1/follow-ups' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_WRITE)(req, res)) return;
  return reminders.createFollowUp(req, res);
}
if (req.url === '/api/v1/follow-ups/timeline' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_READ)(req, res)) return;
  return reminders.timeline(req, res);
}
if (req.url === '/api/v1/follow-ups/due' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_READ)(req, res)) return;
  return reminders.due(req, res);
}
if (req.url === '/api/v1/follow-ups/overdue' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_READ)(req, res)) return;
  return reminders.overdue(req, res);
}
const followUpCompleteMatch = req.url.match(/^\/api\/v1\/follow-ups\/([^/]+)\/complete$/);
if (followUpCompleteMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_WRITE)(req, res)) return;
  return reminders.complete(req, res, followUpCompleteMatch[1]);
}
const followUpSnoozeMatch = req.url.match(/^\/api\/v1\/follow-ups\/([^/]+)\/snooze$/);
if (followUpSnoozeMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.REMINDERS_WRITE)(req, res)) return;
  return reminders.snooze(req, res, followUpSnoozeMatch[1]);
}
const followUpMatch = req.url.match(/^\/api\/v1\/follow-ups\/([^/]+)$/);
if (followUpMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.REMINDERS_READ)(req, res)) return;
  return reminders.getFollowUp(req, res, followUpMatch[1]);
}
if (followUpMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.REMINDERS_WRITE)(req, res)) return;
  return reminders.updateFollowUp(req, res, followUpMatch[1]);
}
```
