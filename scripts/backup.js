require('dotenv').config();

const fs = require('fs');
const path = require('path');

const backupDir = path.resolve('./backups');
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const manifest = {
  createdAt: new Date().toISOString(),
  app: 'servicepro',
  sprint: 27,
  databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  note: 'This script writes a backup manifest. Add pg_dump execution for live PostgreSQL backups.'
};

const file = path.join(backupDir, `backup-manifest-${stamp}.json`);
fs.writeFileSync(file, JSON.stringify(manifest, null, 2));
console.log(`Backup manifest written: ${file}`);
