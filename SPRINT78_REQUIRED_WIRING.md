# Sprint 78 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const priceBook = require('./routes/priceBook');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/pricebook/categories' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_READ)(req, res)) return;
  return priceBook.listCategories(req, res);
}
if (req.url === '/api/v1/pricebook/categories' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_WRITE)(req, res)) return;
  return priceBook.createCategory(req, res);
}
if (req.url === '/api/v1/pricebook/items' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_READ)(req, res)) return;
  return priceBook.listItems(req, res);
}
if (req.url === '/api/v1/pricebook/items' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_WRITE)(req, res)) return;
  return priceBook.createItem(req, res);
}
if (req.url === '/api/v1/pricebook/publish' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_WRITE)(req, res)) return;
  return priceBook.publish(req, res);
}
const priceBookLineMatch = req.url.match(/^\/api\/v1\/pricebook\/items\/([^/]+)\/line-preview$/);
if (priceBookLineMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_READ)(req, res)) return;
  return priceBook.linePreview(req, res, priceBookLineMatch[1]);
}
const priceBookItemMatch = req.url.match(/^\/api\/v1\/pricebook\/items\/([^/]+)$/);
if (priceBookItemMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_READ)(req, res)) return;
  return priceBook.getItem(req, res, priceBookItemMatch[1]);
}
if (priceBookItemMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.PRICEBOOK_WRITE)(req, res)) return;
  return priceBook.updateItem(req, res, priceBookItemMatch[1]);
}
```
