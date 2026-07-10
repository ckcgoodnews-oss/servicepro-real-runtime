const fs = require('fs');

const required = [
  'apps/api/src/services/mobileSyncService.js',
  'apps/api/src/repositories/mobileSyncRepository.js',
  'apps/api/src/routes/mobileSync.js',
  'scripts/seed-mobile-sync.js',
  'packages/database/postgres/097_mobile_offline_sync_runtime.sql',
  'docs/sprint97-mobile-offline-sync-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 97 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  makeDeviceToken,
  normalizeEntityType,
  normalizeDeviceInput,
  normalizeOfflineChangeInput,
  detectConflict,
  applyChangeToRecord,
  buildPullPackage,
  summarizeSyncChanges
} = require('../apps/api/src/services/mobileSyncService');

if (makeDeviceToken().length !== 48) {
  console.error('Device token generation failed.');
  process.exit(1);
}

if (normalizeEntityType('Job Status') !== 'job_status') {
  console.error('Entity type normalization failed.');
  process.exit(1);
}

const device = normalizeDeviceInput({
  userId: 'user1',
  technicianId: 'tech1',
  deviceName: 'Tech Phone',
  devicePlatform: 'android'
});

if (device.status !== 'active' || !device.deviceToken) {
  console.error('Device normalization failed.');
  process.exit(1);
}

const change = normalizeOfflineChangeInput({
  deviceId: 'device1',
  clientChangeId: 'c1',
  entityType: 'job',
  entityId: 'job1',
  operation: 'update',
  baseVersion: 2,
  payload: { status: 'complete' }
});

const conflict = detectConflict(change, { id: 'job1', version: 3 });
if (!conflict.conflict) {
  console.error('Conflict detection failed.');
  process.exit(1);
}

const applied = applyChangeToRecord({ ...change, baseVersion: 2 }, { id: 'job1', version: 2, status: 'scheduled' }, 'client_wins');
if (applied.status !== 'complete' || applied.version !== 3) {
  console.error('Apply change failed.');
  process.exit(1);
}

const pkg = buildPullPackage({
  deviceId: 'device1',
  sinceVersion: 2,
  entities: {
    jobs: [{ id: 'job1', version: 1 }, { id: 'job2', version: 3 }]
  }
});
if (pkg.changes.jobs.length !== 1 || pkg.serverVersion !== 3) {
  console.error('Pull package build failed.');
  process.exit(1);
}

const summary = summarizeSyncChanges([{ status: 'applied' }, { status: 'conflict' }, { status: 'queued' }]);
if (summary.total !== 3 || summary.conflicts !== 1) {
  console.error('Sync summary failed.');
  process.exit(1);
}

console.log('Sprint 97 mobile offline sync runtime patch test passed.');
