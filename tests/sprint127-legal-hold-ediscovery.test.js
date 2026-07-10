const fs = require('fs');

const required = [
  'apps/api/src/services/legalHoldService.js',
  'apps/api/src/repositories/legalHoldRepository.js',
  'apps/api/src/routes/legalHold.js',
  'scripts/seed-legal-hold-ediscovery.js',
  'packages/database/postgres/127_legal_hold_ediscovery.sql',
  'docs/sprint127-legal-hold-ediscovery.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 127 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeMatterInput,
  normalizeHoldInput,
  normalizeCustodianInput,
  normalizeScopeInput,
  normalizeCollectionJobInput,
  normalizeExportJobInput,
  issueHold,
  releaseHold,
  acknowledgeCustodian,
  releaseCustodian,
  markScopePreserved,
  startCollection,
  completeCollection,
  failCollection,
  startExport,
  completeExport,
  failExport,
  closeMatter,
  holdResponseDue,
  legalHoldMetrics
} = require('../apps/api/src/services/legalHoldService');

let matter = normalizeMatterInput({ tenantId: 'tenant_demo', name: 'Matter', matterType: 'litigation' });
if (matter.status !== 'open') process.exit(1);

let hold = normalizeHoldInput({ matterId: 'matter1', title: 'Hold' });
hold = issueHold(hold, 'legal');
if (hold.status !== 'active') process.exit(1);
hold = releaseHold(hold, 'legal');
if (hold.status !== 'released') process.exit(1);

let custodian = normalizeCustodianInput({ holdId: 'hold1', email: 'user@example.com', notifiedAt: '2026-07-07T00:00:00.000Z' });
if (!holdResponseDue(custodian, 7).startsWith('2026-07-14')) process.exit(1);
custodian = acknowledgeCustodian(custodian);
custodian = releaseCustodian(custodian);
if (custodian.status !== 'released') process.exit(1);

let scope = normalizeScopeInput({ holdId: 'hold1', scopeType: 'document' });
scope = markScopePreserved(scope);
if (!scope.preserved) process.exit(1);

let collection = normalizeCollectionJobInput({ holdId: 'hold1' });
collection = startCollection(collection);
collection = completeCollection(collection, 10, 's3://legal/out');
if (collection.status !== 'completed' || collection.itemCount !== 10) process.exit(1);
const failedCollection = failCollection(normalizeCollectionJobInput({ holdId: 'hold1' }), 'bad');
if (failedCollection.status !== 'failed') process.exit(1);

let exportJob = normalizeExportJobInput({ matterId: 'matter1', format: 'zip' });
exportJob = startExport(exportJob);
exportJob = completeExport(exportJob, 's3://legal/export.zip', 10);
if (exportJob.status !== 'completed') process.exit(1);
const failedExport = failExport(normalizeExportJobInput({ matterId: 'matter1' }), 'bad');
if (failedExport.status !== 'failed') process.exit(1);

matter = closeMatter(matter);
if (matter.status !== 'closed') process.exit(1);

const metrics = legalHoldMetrics({ matters: [matter], holds: [{ ...hold, status: 'active' }], custodians: [{ ...custodian, status: 'notified' }], collections: [collection], exports: [exportJob] });
if (metrics.activeHolds !== 1 || metrics.completedExports !== 1) process.exit(1);

console.log('Sprint 127 legal hold eDiscovery patch test passed.');
