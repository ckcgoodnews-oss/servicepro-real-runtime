# Sprint 98 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const biDashboards = require('./routes/biDashboards');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/bi/dashboards' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BI_READ)(req, res)) return;
  return biDashboards.listDashboards(req, res);
}
if (req.url === '/api/v1/bi/dashboards' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BI_WRITE)(req, res)) return;
  return biDashboards.createDashboard(req, res);
}
if (req.url === '/api/v1/bi/metrics' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BI_READ)(req, res)) return;
  return biDashboards.listMetrics(req, res);
}
if (req.url === '/api/v1/bi/metrics' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BI_WRITE)(req, res)) return;
  return biDashboards.captureMetric(req, res);
}
if (req.url === '/api/v1/bi/summary' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BI_READ)(req, res)) return;
  return biDashboards.summary(req, res);
}
const biWidgetsMatch = req.url.match(/^\/api\/v1\/bi\/dashboards\/([^/]+)\/widgets$/);
if (biWidgetsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BI_READ)(req, res)) return;
  return biDashboards.listWidgets(req, res, biWidgetsMatch[1]);
}
if (biWidgetsMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BI_WRITE)(req, res)) return;
  return biDashboards.createWidget(req, res, biWidgetsMatch[1]);
}
const biRenderMatch = req.url.match(/^\/api\/v1\/bi\/dashboards\/([^/]+)\/render$/);
if (biRenderMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BI_READ)(req, res)) return;
  return biDashboards.render(req, res, biRenderMatch[1]);
}
const biDashboardMatch = req.url.match(/^\/api\/v1\/bi\/dashboards\/([^/]+)$/);
if (biDashboardMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BI_READ)(req, res)) return;
  return biDashboards.getDashboard(req, res, biDashboardMatch[1]);
}
```
