# Sprint 77 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const customerAssets = require('./routes/customerAssets');
```

Add these routes before the generic `routeSets` block:

```js
if (req.url === '/api/v1/customer-assets' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_READ)(req, res)) return;
  return customerAssets.list(req, res);
}
if (req.url === '/api/v1/customer-assets' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_WRITE)(req, res)) return;
  return customerAssets.create(req, res);
}
const customerAssetsMatch = req.url.match(/^\/api\/v1\/customers\/([^/]+)\/assets$/);
if (customerAssetsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_READ)(req, res)) return;
  return customerAssets.listForCustomer(req, res, customerAssetsMatch[1]);
}
const assetHistoryMatch = req.url.match(/^\/api\/v1\/customer-assets\/([^/]+)\/history$/);
if (assetHistoryMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_READ)(req, res)) return;
  return customerAssets.listHistory(req, res, assetHistoryMatch[1]);
}
if (assetHistoryMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_WRITE)(req, res)) return;
  return customerAssets.createHistory(req, res, assetHistoryMatch[1]);
}
const assetMatch = req.url.match(/^\/api\/v1\/customer-assets\/([^/]+)$/);
if (assetMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_READ)(req, res)) return;
  return customerAssets.get(req, res, assetMatch[1]);
}
if (assetMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.CUSTOMER_ASSETS_WRITE)(req, res)) return;
  return customerAssets.update(req, res, assetMatch[1]);
}
```
