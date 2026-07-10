# Sprint 92 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const surveys = require('./routes/surveys');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/surveys/templates' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.SURVEYS_READ)(req, res)) return;
  return surveys.listTemplates(req, res);
}
if (req.url === '/api/v1/surveys/templates' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SURVEYS_WRITE)(req, res)) return;
  return surveys.createTemplate(req, res);
}
if (req.url === '/api/v1/surveys/sends' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.SURVEYS_READ)(req, res)) return;
  return surveys.listSends(req, res);
}
if (req.url === '/api/v1/surveys/sends' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SURVEYS_WRITE)(req, res)) return;
  return surveys.createSend(req, res);
}
const surveyMarkSentMatch = req.url.match(/^\/api\/v1\/surveys\/sends\/([^/]+)\/mark-sent$/);
if (surveyMarkSentMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SURVEYS_WRITE)(req, res)) return;
  return surveys.markSent(req, res, surveyMarkSentMatch[1]);
}
if (req.url === '/api/v1/surveys/responses' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.SURVEYS_READ)(req, res)) return;
  return surveys.listResponses(req, res);
}
if (req.url === '/api/v1/surveys/responses' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SURVEYS_WRITE)(req, res)) return;
  return surveys.createResponse(req, res);
}
if (req.url === '/api/v1/surveys/summary' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.SURVEYS_READ)(req, res)) return;
  return surveys.summary(req, res);
}
```
