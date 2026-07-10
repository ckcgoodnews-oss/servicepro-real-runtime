const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const backupDir = process.env.BACKUP_DIR || './backups';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const output = path.join(backupDir, `servicepro-postgres-${stamp}.dump`);

if (!databaseUrl) {
  console.error('DATABASE_URL is required to generate a PostgreSQL backup command.');
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });

const command = `pg_dump --format=custom --no-owner --no-acl --file="${output}" "${databaseUrl}"`;

console.log(command);
console.log('');
console.log('Restore command:');
console.log(`pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "${output}"`);
