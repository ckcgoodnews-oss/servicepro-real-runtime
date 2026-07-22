const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

const root = process.cwd();
const migrationDir = path.join(root, 'packages', 'database', 'postgres');
const migrationPath = path.join(migrationDir, '065_reporting_runtime.sql');

if (!fs.existsSync(migrationPath)) {
  fail(`Missing ${path.relative(root, migrationPath)}`);
  process.exit();
}

const sql = fs.readFileSync(migrationPath, 'utf8');
const requiredPatterns = [
  /SELECT\s+tenant_id::text\s+AS\s+tenant_id\s+FROM\s+customers/i,
  /SELECT\s+tenant_id::text\s+AS\s+tenant_id\s+FROM\s+jobs/i,
  /SELECT\s+tenant_id::text\s+AS\s+tenant_id\s+FROM\s+invoices/i,
  /SELECT\s+tenant_id::text\s+AS\s+tenant_id\s+FROM\s+payments/i,
  /GROUP\s+BY\s+tenant_id::text/i,
  /CREATE\s+OR\s+REPLACE\s+VIEW\s+reporting_dashboard_summary/i,
];

for (const pattern of requiredPatterns) {
  if (!pattern.test(sql)) fail(`065 repair does not satisfy ${pattern}`);
}

const migrationFiles = fs.readdirSync(migrationDir)
  .filter(name => /^\d{3}_.+\.sql$/.test(name))
  .sort();

const index065 = migrationFiles.indexOf('065_reporting_runtime.sql');
if (index065 < 0) fail('065_reporting_runtime.sql is not part of the migration inventory.');

const subsequent = migrationFiles.slice(index065 + 1);
if (!subsequent.length) fail('No subsequent migrations were found after migration 065.');

for (const required of [
  '717_enterprise_web_identity.sql',
  '720_user_profile_experience.sql',
]) {
  if (!migrationFiles.includes(required)) fail(`Required subsequent migration is missing: ${required}`);
}

if (!process.exitCode) {
  console.log('PASS: Migration 065 normalizes mixed uuid/text tenant IDs.');
  console.log(`PASS: ${subsequent.length} subsequent migration(s) follow migration 065.`);
  console.log(`PASS: Latest migration is ${migrationFiles[migrationFiles.length - 1]}.`);
}
