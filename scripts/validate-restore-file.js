const fs = require('fs');
const path = require('path');
const { validateBackupJsonShape, sha256File } = require('../apps/api/src/services/backupManifestService');

const file = process.argv[2] || process.env.RESTORE_FILE;

if (!file) {
  console.error('Usage: node scripts/validate-restore-file.js <backup-json-file>');
  process.exit(1);
}

const resolved = path.resolve(file);
if (!fs.existsSync(resolved)) {
  console.error(`Restore file not found: ${resolved}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
} catch (err) {
  console.error(`Restore file is not valid JSON: ${err.message}`);
  process.exit(1);
}

const validation = validateBackupJsonShape(data);
if (!validation.ok) {
  console.error(`Restore file missing required arrays: ${validation.missing.join(', ')}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  file: resolved,
  sha256: sha256File(resolved),
  customers: data.customers.length,
  jobs: data.jobs.length,
  invoices: data.invoices.length
}, null, 2));
