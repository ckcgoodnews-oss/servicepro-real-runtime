const fs = require('fs');
const path = require('path');

const backupDir = path.resolve(process.env.BACKUP_DIR || './backups');
const keepDays = Number(process.env.BACKUP_KEEP_DAYS || 30);
const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;

if (!fs.existsSync(backupDir)) {
  console.log(JSON.stringify({ backupDir, keepDays, files: [], purgeCandidates: [] }, null, 2));
  process.exit(0);
}

const files = fs.readdirSync(backupDir).map(name => {
  const fullPath = path.join(backupDir, name);
  const stat = fs.statSync(fullPath);
  return {
    name,
    path: fullPath,
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
    purgeCandidate: stat.mtime.getTime() < cutoff
  };
});

console.log(JSON.stringify({
  backupDir,
  keepDays,
  files,
  purgeCandidates: files.filter(f => f.purgeCandidate)
}, null, 2));
