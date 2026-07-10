# Sprint 87 Required Router Wiring

This patch includes complete service, repository, route, migration, and test files.

Add this import to `apps/api/src/router.js`:

```js
const territories = require('./routes/territories');
```

Add these routes before the generic routeSets block:

```js
if (req.url === '/api/v1/territories' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_READ)(req, res)) return;
  return territories.listTerritories(req, res);
}
if (req.url === '/api/v1/territories' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_WRITE)(req, res)) return;
  return territories.createTerritory(req, res);
}
if (req.url === '/api/v1/territories/match' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_READ)(req, res)) return;
  return territories.matchAddress(req, res);
}
if (req.url === '/api/v1/territory-rules' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_READ)(req, res)) return;
  return territories.listCoverageRules(req, res);
}
if (req.url === '/api/v1/territory-rules' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_WRITE)(req, res)) return;
  return territories.createCoverageRule(req, res);
}
if (req.url === '/api/v1/technician-territories' && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_READ)(req, res)) return;
  return territories.listTechnicianTerritories(req, res);
}
if (req.url === '/api/v1/technician-territories' && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_WRITE)(req, res)) return;
  return territories.createTechnicianTerritory(req, res);
}
const territoryRulesMatch = req.url.match(/^\/api\/v1\/territories\/([^/]+)\/rules$/);
if (territoryRulesMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_READ)(req, res)) return;
  return territories.listCoverageRules(req, res, territoryRulesMatch[1]);
}
if (territoryRulesMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_WRITE)(req, res)) return;
  return territories.createCoverageRule(req, res, territoryRulesMatch[1]);
}
const territoryTechMatch = req.url.match(/^\/api\/v1\/territories\/([^/]+)\/technicians$/);
if (territoryTechMatch && req.method === 'GET') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_READ)(req, res)) return;
  return territories.listTechnicianTerritories(req, res, territoryTechMatch[1]);
}
if (territoryTechMatch && req.method === 'POST') {
  if (!requirePermission(PERMISSIONS.TERRITORIES_WRITE)(req, res)) return;
  return territories.createTechnicianTerritory(req, res, territoryTechMatch[1]);
}
```
