# Sprint 82 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const mediaAttachments = require('./routes/mediaAttachments');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/media' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.MEDIA_READ)(req, res)) return;
  return mediaAttachments.list(req, res);
}
if (req.url === '/api/v1/media' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MEDIA_WRITE)(req, res)) return;
  return mediaAttachments.create(req, res);
}
const mediaMatch = req.url.match(/^\/api\/v1\/media\/([^/]+)$/);
if (mediaMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.MEDIA_READ)(req, res)) return;
  return mediaAttachments.get(req, res, mediaMatch[1]);
}
if (mediaMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.MEDIA_WRITE)(req, res)) return;
  return mediaAttachments.update(req, res, mediaMatch[1]);
}
if (mediaMatch && req.method === 'DELETE') {
  if (!requirePermission(PERMISSIONS.MEDIA_DELETE)(req, res)) return;
  return mediaAttachments.remove(req, res, mediaMatch[1]);
}
const entityMediaMatch = req.url.match(/^\/api\/v1\/(jobs|customers|customer-assets|invoices|estimates|job-checklists|payments|service-agreements)\/([^/]+)\/media$/);
if (entityMediaMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.MEDIA_READ)(req, res)) return;
  const map = {
    jobs: 'job',
    customers: 'customer',
    'customer-assets': 'asset',
    invoices: 'invoice',
    estimates: 'estimate',
    'job-checklists': 'checklist',
    payments: 'payment',
    'service-agreements': 'agreement'
  };
  return mediaAttachments.listForEntity(req, res, map[entityMediaMatch[1]], entityMediaMatch[2]);
}
if (entityMediaMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.MEDIA_WRITE)(req, res)) return;
  const map = {
    jobs: 'job',
    customers: 'customer',
    'customer-assets': 'asset',
    invoices: 'invoice',
    estimates: 'estimate',
    'job-checklists': 'checklist',
    payments: 'payment',
    'service-agreements': 'agreement'
  };
  return mediaAttachments.createForEntity(req, res, map[entityMediaMatch[1]], entityMediaMatch[2]);
}
```
