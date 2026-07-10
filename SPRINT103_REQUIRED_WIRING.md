# Sprint 103 Required Router Wiring

Add this import to `apps/api/src/router.js`:

```js
const dataGovernance = require('./routes/dataGovernance');
```

Add these repository and permission registrations manually if you are not replacing the central factory/permissions files:

```js
// repositoryFactory.js
const { createDataGovernanceRepository } = require('./dataGovernanceRepository');
// inside createRepositories return object:
dataGovernance: createDataGovernanceRepository(store),

// permissions.js
DATA_GOVERNANCE_READ: 'data.governance.read',
DATA_GOVERNANCE_WRITE: 'data.governance.write',
```

Add routes:

```js
if (req.url === '/api/v1/data-governance/classifications' && req.method === 'GET') return dataGovernance.listClassificationPolicies(req, res);
if (req.url === '/api/v1/data-governance/classifications' && req.method === 'POST') return dataGovernance.createClassificationPolicy(req, res);
if (req.url === '/api/v1/data-governance/retention-policies' && req.method === 'GET') return dataGovernance.listRetentionPolicies(req, res);
if (req.url === '/api/v1/data-governance/retention-policies' && req.method === 'POST') return dataGovernance.createRetentionPolicy(req, res);
if (req.url === '/api/v1/data-governance/legal-holds' && req.method === 'GET') return dataGovernance.listLegalHolds(req, res);
if (req.url === '/api/v1/data-governance/legal-holds' && req.method === 'POST') return dataGovernance.createLegalHold(req, res);
const releaseHoldMatch = req.url.match(/^\/api\/v1\/data-governance\/legal-holds\/([^/]+)\/release$/);
if (releaseHoldMatch && req.method === 'POST') return dataGovernance.releaseLegalHold(req, res, releaseHoldMatch[1]);
if (req.url === '/api/v1/data-governance/evaluate-retention' && req.method === 'POST') return dataGovernance.evaluateRetention(req, res);
if (req.url === '/api/v1/data-governance/purge-jobs/plan' && req.method === 'POST') return dataGovernance.planPurgeJob(req, res);
if (req.url === '/api/v1/data-governance/purge-jobs' && req.method === 'GET') return dataGovernance.listPurgeJobs(req, res);
const approvePurgeMatch = req.url.match(/^\/api\/v1\/data-governance\/purge-jobs\/([^/]+)\/approve$/);
if (approvePurgeMatch && req.method === 'POST') return dataGovernance.approvePurgeJob(req, res, approvePurgeMatch[1]);
const completePurgeMatch = req.url.match(/^\/api\/v1\/data-governance\/purge-jobs\/([^/]+)\/complete$/);
if (completePurgeMatch && req.method === 'POST') return dataGovernance.completePurgeJob(req, res, completePurgeMatch[1]);
if (req.url === '/api/v1/data-governance/decisions' && req.method === 'GET') return dataGovernance.listDecisions(req, res);
if (req.url === '/api/v1/data-governance/decisions' && req.method === 'POST') return dataGovernance.recordDecision(req, res);
```
