# Sprint 88 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const routePlans = require('./routes/routePlans');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/route-plans' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.ROUTES_READ)(req, res)) return;
  return routePlans.listPlans(req, res);
}
if (req.url === '/api/v1/route-plans' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.ROUTES_WRITE)(req, res)) return;
  return routePlans.createPlan(req, res);
}
const routeStopsMatch = req.url.match(/^\/api\/v1\/route-plans\/([^/]+)\/stops$/);
if (routeStopsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.ROUTES_READ)(req, res)) return;
  return routePlans.listStops(req, res, routeStopsMatch[1]);
}
if (routeStopsMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.ROUTES_WRITE)(req, res)) return;
  return routePlans.createStop(req, res, routeStopsMatch[1]);
}
const routeOptimizeMatch = req.url.match(/^\/api\/v1\/route-plans\/([^/]+)\/optimize$/);
if (routeOptimizeMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.ROUTES_WRITE)(req, res)) return;
  return routePlans.optimize(req, res, routeOptimizeMatch[1]);
}
const routeSummaryMatch = req.url.match(/^\/api\/v1\/route-plans\/([^/]+)\/summary$/);
if (routeSummaryMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.ROUTES_READ)(req, res)) return;
  return routePlans.summary(req, res, routeSummaryMatch[1]);
}
const routePlanMatch = req.url.match(/^\/api\/v1\/route-plans\/([^/]+)$/);
if (routePlanMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.ROUTES_READ)(req, res)) return;
  return routePlans.getPlan(req, res, routePlanMatch[1]);
}
if (routePlanMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.ROUTES_WRITE)(req, res)) return;
  return routePlans.updatePlan(req, res, routePlanMatch[1]);
}
```
