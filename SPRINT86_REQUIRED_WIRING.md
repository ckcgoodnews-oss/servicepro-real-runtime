# Sprint 86 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const payroll = require('./routes/payroll');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/payroll/periods' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PAYROLL_READ)(req, res)) return;
  return payroll.listPeriods(req, res);
}
if (req.url === '/api/v1/payroll/periods' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PAYROLL_WRITE)(req, res)) return;
  return payroll.createPeriod(req, res);
}
if (req.url === '/api/v1/payroll/exports' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PAYROLL_READ)(req, res)) return;
  return payroll.listExports(req, res);
}
if (req.url === '/api/v1/payroll/exports/generate' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PAYROLL_WRITE)(req, res)) return;
  return payroll.generateExport(req, res);
}
const payrollApproveMatch = req.url.match(/^\/api\/v1\/payroll\/exports\/([^/]+)\/approve$/);
if (payrollApproveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PAYROLL_APPROVE)(req, res)) return;
  return payroll.approveExport(req, res, payrollApproveMatch[1]);
}
const payrollExportedMatch = req.url.match(/^\/api\/v1\/payroll\/exports\/([^/]+)\/mark-exported$/);
if (payrollExportedMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.PAYROLL_WRITE)(req, res)) return;
  return payroll.markExported(req, res, payrollExportedMatch[1]);
}
const payrollExportMatch = req.url.match(/^\/api\/v1\/payroll\/exports\/([^/]+)$/);
if (payrollExportMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.PAYROLL_READ)(req, res)) return;
  return payroll.getExport(req, res, payrollExportMatch[1]);
}
```
