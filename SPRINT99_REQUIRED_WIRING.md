# Sprint 99 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const branding = require('./routes/branding');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/branding/brands' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BRANDING_READ)(req, res)) return;
  return branding.listBrands(req, res);
}
if (req.url === '/api/v1/branding/brands' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BRANDING_WRITE)(req, res)) return;
  return branding.createBrand(req, res);
}
const brandAssetsMatch = req.url.match(/^\/api\/v1\/branding\/brands\/([^/]+)\/assets$/);
if (brandAssetsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BRANDING_READ)(req, res)) return;
  return branding.listAssets(req, res, brandAssetsMatch[1]);
}
if (brandAssetsMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BRANDING_WRITE)(req, res)) return;
  return branding.createAsset(req, res, brandAssetsMatch[1]);
}
const brandDomainsMatch = req.url.match(/^\/api\/v1\/branding\/brands\/([^/]+)\/domains$/);
if (brandDomainsMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BRANDING_READ)(req, res)) return;
  return branding.listDomains(req, res, brandDomainsMatch[1]);
}
if (brandDomainsMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BRANDING_WRITE)(req, res)) return;
  return branding.createDomain(req, res, brandDomainsMatch[1]);
}
const brandResolveMatch = req.url.match(/^\/api\/v1\/branding\/brands\/([^/]+)\/resolve$/);
if (brandResolveMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BRANDING_READ)(req, res)) return;
  return branding.resolve(req, res, brandResolveMatch[1]);
}
const brandCssMatch = req.url.match(/^\/api\/v1\/branding\/brands\/([^/]+)\/theme\.css$/);
if (brandCssMatch && req.method === 'GET') {
  return branding.css(req, res, brandCssMatch[1]);
}
const domainVerifyMatch = req.url.match(/^\/api\/v1\/branding\/domains\/([^/]+)\/verify$/);
if (domainVerifyMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.BRANDING_WRITE)(req, res)) return;
  return branding.verifyDomain(req, res, domainVerifyMatch[1]);
}
const brandMatch = req.url.match(/^\/api\/v1\/branding\/brands\/([^/]+)$/);
if (brandMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.BRANDING_READ)(req, res)) return;
  return branding.getBrand(req, res, brandMatch[1]);
}
if (brandMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.BRANDING_WRITE)(req, res)) return;
  return branding.updateBrand(req, res, brandMatch[1]);
}
```
