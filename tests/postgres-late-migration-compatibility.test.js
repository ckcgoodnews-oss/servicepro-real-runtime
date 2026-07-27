const assert = require('assert');
const fs = require('fs');

const crmMigration = fs.readFileSync('packages/database/postgres/779_crm_and_marketing.sql', 'utf8');
for (const column of ['stage', 'source', 'assigned_to', 'tags', 'converted_at']) {
  assert.match(crmMigration, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}\\b`));
}
assert.match(crmMigration, /ALTER TABLE crm_leads ALTER COLUMN tenant_id TYPE text/);
assert.match(crmMigration, /ALTER TABLE marketing_campaigns ALTER COLUMN tenant_id TYPE text/);
assert.match(crmMigration, /ALTER TABLE marketing_campaigns ALTER COLUMN channel SET DEFAULT 'email'/);

const websiteMigration = fs.readFileSync('packages/database/postgres/780_website_builder_and_automation.sql', 'utf8');
assert.match(websiteMigration, /embedding jsonb/);
assert.doesNotMatch(websiteMigration, /embedding vector\s*\(/);

for (const repository of ['crmLeadsRepository.js', 'marketingCampaignsRepository.js']) {
  const source = fs.readFileSync(`apps/api/src/repositories/${repository}`, 'utf8');
  const postgresBody = source.slice(source.indexOf('function createPostgresImpl'));
  assert.doesNotMatch(postgresBody, /return createJsonImpl\(store\)/);
  assert.match(postgresBody, /await store\.query/);
}

console.log('Late PostgreSQL migration compatibility test passed.');
