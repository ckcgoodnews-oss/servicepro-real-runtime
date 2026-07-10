# Sprint 102 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const complianceEvidence = require('./routes/complianceEvidence');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/compliance/frameworks' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_READ)(req, res)) return;
  return complianceEvidence.listFrameworks(req, res);
}
if (req.url === '/api/v1/compliance/frameworks' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createFramework(req, res);
}
if (req.url === '/api/v1/compliance/controls' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_READ)(req, res)) return;
  return complianceEvidence.listControls(req, res);
}
if (req.url === '/api/v1/compliance/controls' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createControl(req, res);
}
if (req.url === '/api/v1/compliance/packages' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_READ)(req, res)) return;
  return complianceEvidence.listPackages(req, res);
}
if (req.url === '/api/v1/compliance/packages' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createPackage(req, res);
}
if (req.url === '/api/v1/compliance/evidence' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_READ)(req, res)) return;
  return complianceEvidence.listEvidenceItems(req, res);
}
if (req.url === '/api/v1/compliance/evidence' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createEvidenceItem(req, res);
}
const evReviewMatch = req.url.match(/^\/api\/v1\/compliance\/evidence\/([^/]+)\/review$/);
if (evReviewMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.reviewEvidenceItem(req, res, evReviewMatch[1]);
}
if (req.url === '/api/v1/compliance/mappings' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_READ)(req, res)) return;
  return complianceEvidence.listMappings(req, res);
}
if (req.url === '/api/v1/compliance/mappings' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createMapping(req, res);
}
if (req.url === '/api/v1/compliance/attestations' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createAttestation(req, res);
}
const attApproveMatch = req.url.match(/^\/api\/v1\/compliance\/attestations\/([^/]+)\/approve$/);
if (attApproveMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.approveAttestation(req, res, attApproveMatch[1]);
}
if (req.url === '/api/v1/compliance/exports' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.createExport(req, res);
}
const expCompleteMatch = req.url.match(/^\/api\/v1\/compliance\/exports\/([^/]+)\/complete$/);
if (expCompleteMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_WRITE)(req, res)) return;
  return complianceEvidence.completeExport(req, res, expCompleteMatch[1]);
}
if (req.url === '/api/v1/compliance/score' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.COMPLIANCE_READ)(req, res)) return;
  return complianceEvidence.score(req, res);
}
```
