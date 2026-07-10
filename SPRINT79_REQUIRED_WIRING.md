# Sprint 79 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const purchasing = require('./routes/purchasing');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/vendors' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PURCHASING_READ)(req, res)) return;
  return purchasing.listVendors(req, res);
}
if (req.url === '/api/v1/vendors' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PURCHASING_WRITE)(req, res)) return;
  return purchasing.createVendor(req, res);
}
const vendorMatch = req.url.match(/^\/api\/v1\/vendors\/([^/]+)$/);
if (vendorMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PURCHASING_READ)(req, res)) return;
  return purchasing.getVendor(req, res, vendorMatch[1]);
}
if (vendorMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.PURCHASING_WRITE)(req, res)) return;
  return purchasing.updateVendor(req, res, vendorMatch[1]);
}

if (req.url === '/api/v1/purchase-orders' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PURCHASING_READ)(req, res)) return;
  return purchasing.listPurchaseOrders(req, res);
}
if (req.url === '/api/v1/purchase-orders' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PURCHASING_WRITE)(req, res)) return;
  return purchasing.createPurchaseOrder(req, res);
}
const poReceiveMatch = req.url.match(/^\/api\/v1\/purchase-orders\/([^/]+)\/receive$/);
if (poReceiveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PURCHASING_WRITE)(req, res)) return;
  return purchasing.receivePurchaseOrder(req, res, poReceiveMatch[1]);
}
const poReceiptsMatch = req.url.match(/^\/api\/v1\/purchase-orders\/([^/]+)\/receipts$/);
if (poReceiptsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PURCHASING_READ)(req, res)) return;
  return purchasing.receipts(req, res, poReceiptsMatch[1]);
}
const poMatch = req.url.match(/^\/api\/v1\/purchase-orders\/([^/]+)$/);
if (poMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PURCHASING_READ)(req, res)) return;
  return purchasing.getPurchaseOrder(req, res, poMatch[1]);
}
if (poMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.PURCHASING_WRITE)(req, res)) return;
  return purchasing.updatePurchaseOrder(req, res, poMatch[1]);
}
```
