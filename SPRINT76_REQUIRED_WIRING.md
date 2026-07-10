# Sprint 76 Required Wiring

This patch includes complete new files and the package/test/migration changes.

Add these imports to `apps/api/src/repositories/repositoryFactory.js`:

```js
const { createServiceAgreementRepository } = require('./serviceAgreementRepository');
const { createAgreementVisitRepository } = require('./agreementVisitRepository');
```

Add these repository properties inside `createRepositories`:

```js
serviceAgreements: createServiceAgreementRepository(store),
agreementVisits: createAgreementVisitRepository(store),
```

Add this permission pair to `apps/api/src/auth/permissions.js`:

```js
AGREEMENTS_READ: 'agreements.read',
AGREEMENTS_WRITE: 'agreements.write',
```

Add them to owner/manager, and `AGREEMENTS_READ` to billing/technician if desired.

Add this import to `apps/api/src/router.js`:

```js
const serviceAgreements = require('./routes/serviceAgreements');
```

Add routes before the generic routeSets block:

```js
if (req.url === '/api/v1/service-agreements' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_READ)(req, res)) return;
  return serviceAgreements.list(req, res);
}
if (req.url === '/api/v1/service-agreements' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_WRITE)(req, res)) return;
  return serviceAgreements.create(req, res);
}
if (req.url === '/api/v1/service-agreements/renewals-due' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_READ)(req, res)) return;
  return serviceAgreements.dueForRenewal(req, res);
}
const agreementVisitMatch = req.url.match(/^\/api\/v1\/service-agreements\/([^/]+)\/visits$/);
if (agreementVisitMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_READ)(req, res)) return;
  return serviceAgreements.listVisits(req, res, agreementVisitMatch[1]);
}
if (agreementVisitMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_WRITE)(req, res)) return;
  return serviceAgreements.createVisit(req, res, agreementVisitMatch[1]);
}
const agreementNextVisitMatch = req.url.match(/^\/api\/v1\/service-agreements\/([^/]+)\/generate-next-visit$/);
if (agreementNextVisitMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_WRITE)(req, res)) return;
  return serviceAgreements.generateNextVisit(req, res, agreementNextVisitMatch[1]);
}
const agreementMatch = req.url.match(/^\/api\/v1\/service-agreements\/([^/]+)$/);
if (agreementMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_READ)(req, res)) return;
  return serviceAgreements.get(req, res, agreementMatch[1]);
}
if (agreementMatch && req.method === 'PATCH') {
  if (!requirePermission(PERMISSIONS.AGREEMENTS_WRITE)(req, res)) return;
  return serviceAgreements.update(req, res, agreementMatch[1]);
}
```
