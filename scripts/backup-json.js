const fs = require('fs');
const path = require('path');
const { buildBackupManifest } = require('../apps/api/src/services/backupManifestService');

const source = path.resolve(process.env.DATA_FILE || './data/servicepro-runtime.json');
const backupDir = path.resolve(process.env.BACKUP_DIR || './backups');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `servicepro-json-${stamp}.json`);
const manifestFile = `${backupFile}.manifest.json`;

if (!fs.existsSync(source)) {
  console.error(`Source data file not found: ${source}`);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(source, backupFile);

const manifest = buildBackupManifest(backupFile, { backupType: 'json' });
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

console.log(JSON.stringify({ backupFile, manifestFile, manifest }, null, 2));
