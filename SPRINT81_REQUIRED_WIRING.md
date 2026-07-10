# Sprint 81 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const checklists = require('./routes/checklists');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/checklist-templates' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.CHECKLISTS_READ)(req, res)) return;
  return checklists.listTemplates(req, res);
}
if (req.url === '/api/v1/checklist-templates' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.CHECKLISTS_WRITE)(req, res)) return;
  return checklists.createTemplate(req, res);
}
if (req.url === '/api/v1/job-checklists' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.CHECKLISTS_READ)(req, res)) return;
  return checklists.listJobChecklists(req, res);
}
const createChecklistMatch = req.url.match(/^\/api\/v1\/checklist-templates\/([^/]+)\/create-job-checklist$/);
if (createChecklistMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.CHECKLISTS_WRITE)(req, res)) return;
  return checklists.createFromTemplate(req, res, createChecklistMatch[1]);
}
const checklistItemMatch = req.url.match(/^\/api\/v1\/job-checklists\/([^/]+)\/items\/([^/]+)$/);
if (checklistItemMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.CHECKLISTS_WRITE)(req, res)) return;
  return checklists.updateItem(req, res, checklistItemMatch[1], checklistItemMatch[2]);
}
const checklistCompleteMatch = req.url.match(/^\/api\/v1\/job-checklists\/([^/]+)\/complete$/);
if (checklistCompleteMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.CHECKLISTS_WRITE)(req, res)) return;
  return checklists.complete(req, res, checklistCompleteMatch[1]);
}
```
