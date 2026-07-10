# Sprint 101 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const tenantSecurity = require('./routes/tenantSecurity');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/tenant-security/policies' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_READ)(req, res)) return;
  return tenantSecurity.listPolicies(req, res);
}
if (req.url === '/api/v1/tenant-security/policies' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_WRITE)(req, res)) return;
  return tenantSecurity.createPolicy(req, res);
}
if (req.url === '/api/v1/tenant-security/evaluate' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_READ)(req, res)) return;
  return tenantSecurity.evaluate(req, res);
}
if (req.url === '/api/v1/tenant-security/decisions' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_READ)(req, res)) return;
  return tenantSecurity.listDecisions(req, res);
}
if (req.url === '/api/v1/tenant-security/summary' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_READ)(req, res)) return;
  return tenantSecurity.summary(req, res);
}
const tenantSecurityPolicyMatch = req.url.match(/^\/api\/v1\/tenant-security\/policies\/([^/]+)$/);
if (tenantSecurityPolicyMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_READ)(req, res)) return;
  return tenantSecurity.getPolicy(req, res, tenantSecurityPolicyMatch[1]);
}
if (tenantSecurityPolicyMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.TENANT_SECURITY_WRITE)(req, res)) return;
  return tenantSecurity.updatePolicy(req, res, tenantSecurityPolicyMatch[1]);
}
```
