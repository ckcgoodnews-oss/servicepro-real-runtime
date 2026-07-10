# Sprint 80 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const warehouses = require('./routes/warehouses');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/warehouses' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_READ)(req, res)) return;
  return warehouses.listWarehouses(req, res);
}
if (req.url === '/api/v1/warehouses' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_WRITE)(req, res)) return;
  return warehouses.createWarehouse(req, res);
}
const whBinsMatch = req.url.match(/^\/api\/v1\/warehouses\/([^/]+)\/bins$/);
if (whBinsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_READ)(req, res)) return;
  return warehouses.listBins(req, res, whBinsMatch[1]);
}
if (whBinsMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_WRITE)(req, res)) return;
  return warehouses.createBin(req, res, whBinsMatch[1]);
}
const whMatch = req.url.match(/^\/api\/v1\/warehouses\/([^/]+)$/);
if (whMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_WRITE)(req, res)) return;
  return warehouses.updateWarehouse(req, res, whMatch[1]);
}
if (req.url === '/api/v1/warehouse-bins' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_READ)(req, res)) return;
  return warehouses.listBins(req, res);
}
if (req.url === '/api/v1/warehouse-bins' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_WRITE)(req, res)) return;
  return warehouses.createBin(req, res);
}
if (req.url === '/api/v1/inventory-transfers' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_READ)(req, res)) return;
  return warehouses.listTransfers(req, res);
}
if (req.url === '/api/v1/inventory-transfers' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_WRITE)(req, res)) return;
  return warehouses.createTransfer(req, res);
}
const transferCompleteMatch = req.url.match(/^\/api\/v1\/inventory-transfers\/([^/]+)\/complete$/);
if (transferCompleteMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.WAREHOUSES_WRITE)(req, res)) return;
  return warehouses.completeTransfer(req, res, transferCompleteMatch[1]);
}
```
