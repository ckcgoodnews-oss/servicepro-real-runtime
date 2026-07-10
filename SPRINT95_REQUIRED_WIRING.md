# Sprint 95 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const predictiveMaintenance = require('./routes/predictiveMaintenance');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/predictive-maintenance/models' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_READ)(req, res)) return;
  return predictiveMaintenance.listModels(req, res);
}
if (req.url === '/api/v1/predictive-maintenance/models' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_WRITE)(req, res)) return;
  return predictiveMaintenance.createModel(req, res);
}
if (req.url === '/api/v1/predictive-maintenance/predictions' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_READ)(req, res)) return;
  return predictiveMaintenance.listPredictions(req, res);
}
if (req.url === '/api/v1/predictive-maintenance/predictions/generate' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_WRITE)(req, res)) return;
  return predictiveMaintenance.generatePrediction(req, res);
}
const predictionConvertMatch = req.url.match(/^\/api\/v1\/predictive-maintenance\/predictions\/([^/]+)\/convert$/);
if (predictionConvertMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_WRITE)(req, res)) return;
  return predictiveMaintenance.markConverted(req, res, predictionConvertMatch[1]);
}
const predictionDismissMatch = req.url.match(/^\/api\/v1\/predictive-maintenance\/predictions\/([^/]+)\/dismiss$/);
if (predictionDismissMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_WRITE)(req, res)) return;
  return predictiveMaintenance.dismiss(req, res, predictionDismissMatch[1]);
}
const predictionMatch = req.url.match(/^\/api\/v1\/predictive-maintenance\/predictions\/([^/]+)$/);
if (predictionMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PREDICTIVE_MAINTENANCE_READ)(req, res)) return;
  return predictiveMaintenance.getPrediction(req, res, predictionMatch[1]);
}
```
