const fs = require('fs');
const path = require('path');
const os = require('os');

const required = [
  'apps/api/src/services/backupManifestService.js',
  'scripts/backup-json.js',
  'scripts/postgres-backup-command.js',
  'scripts/validate-restore-file.js',
  'scripts/backup-retention-report.js',
  'packages/database/postgres/073_backup_recovery_runtime.sql',
  'docs/backup-recovery-guide.md',
  'docs/disaster-recovery-runbook.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 73 patch file: ${file}`);
    process.exit(1);
  }
}

const { buildBackupManifest, validateBackupJsonShape, sha256File } = require('../apps/api/src/services/backupManifestService');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'servicepro-backup-test-'));
const sample = path.join(tmp, 'sample.json');

fs.writeFileSync(sample, JSON.stringify({
  users: [],
  customers: [],
  jobs: [],
  invoices: []
}, null, 2));

const manifest = buildBackupManifest(sample, { backupType: 'json', tenantId: 'tenant_demo' });
if (!manifest.sha256 || manifest.sizeBytes <= 0 || manifest.backupType !== 'json') {
  console.error('Backup manifest failed.');
  process.exit(1);
}

const validation = validateBackupJsonShape(JSON.parse(fs.readFileSync(sample, 'utf8')));
if (!validation.ok) {
  console.error('Backup JSON shape validation failed.');
  process.exit(1);
}

const hash = sha256File(sample);
if (hash !== manifest.sha256) {
  console.error('Backup hash mismatch.');
  process.exit(1);
}

console.log('Sprint 73 backup/recovery runtime patch test passed.');
