const assert = require('assert');
const fs = require('fs');
const { buildBootstrapSql, migrationFiles } = require('../scripts/build-supabase-bootstrap');
const { readCompanyConfig, removeDemoSeed } = require('../scripts/provision-company-database');

const files = migrationFiles();
assert.ok(files.length >= 679, 'The migration bundle must not lose previously certified migrations');
assert.strictEqual(files[0], '040_auth_rbac_sessions.sql');
assert.strictEqual(files.at(-1), '781_tenant_registry_reconciliation.sql');
assert.strictEqual(new Set(files).size, files.length, 'Migration filenames must be unique');
const migrationNumbers = files.map(file => file.slice(0, 3));
assert.strictEqual(new Set(migrationNumbers).size, files.length, 'Migration identifiers must be unique');
assert.ok(files.every(file => /^\d{3}_[a-z0-9_.]+\.sql$/.test(file)), 'Migration filenames must follow the canonical convention');
for (const required of ['728_expanded_service_catalog.sql', '779_crm_and_marketing.sql', '780_website_builder_and_automation.sql', '781_tenant_registry_reconciliation.sql']) {
  assert.ok(files.includes(required), `Required migration ${required} is missing`);
}

const sql = buildBootstrapSql();
assert.match(sql, /CREATE TABLE IF NOT EXISTS postgres_runtime_migrations/);
assert.strictEqual((sql.match(/-- BEGIN SERVICEPRO MIGRATION/g) || []).length, files.length);
assert.ok(sql.includes('-- BEGIN SERVICEPRO MIGRATION 040_auth_rbac_sessions.sql'));
assert.ok(sql.includes('-- END SERVICEPRO MIGRATION 780_website_builder_and_automation.sql'));
assert.ok(sql.includes('-- END SERVICEPRO MIGRATION 781_tenant_registry_reconciliation.sql'));
const normalizeLineEndings = value => value.replace(/\r\n/g, '\n');
assert.strictEqual(
  normalizeLineEndings(fs.readFileSync('packages/database/supabase/servicepro-bootstrap.sql', 'utf8')),
  normalizeLineEndings(sql),
  'Committed Supabase bundle must match the source migrations'
);

const config = readCompanyConfig({
  DATA_STORE: 'postgres',
  DATABASE_URL: 'postgresql://example.invalid/postgres',
  COMPANY_TENANT_ID: 'acme_services',
  COMPANY_NAME: 'Acme Services',
  COMPANY_OWNER_EMAIL: 'OWNER@ACME.EXAMPLE',
  COMPANY_OWNER_PASSWORD: 'UniquePass123!'
});
assert.strictEqual(config.tenantId, 'acme_services');
assert.strictEqual(config.ownerEmail, 'owner@acme.example');
assert.strictEqual(config.keepDemoData, false);
assert.throws(() => readCompanyConfig({}), /DATABASE_URL is required/);
assert.throws(() => readCompanyConfig({ DATA_STORE:'json',DATABASE_URL:'x',COMPANY_TENANT_ID:'acme',COMPANY_NAME:'Acme',COMPANY_OWNER_EMAIL:'owner@acme.example',COMPANY_OWNER_PASSWORD:'UniquePass123!' }), /DATA_STORE must be postgres/);

(async () => {
  const calls = [];
  await removeDemoSeed({ query: async (statement, params) => { calls.push({ statement, params }); return { rows: [], rowCount: 0 }; } });
  assert.strictEqual(calls.length, 8);
  assert.ok(calls.every(call => call.params[0] === 'tenant_demo'));

  assert.ok(fs.readFileSync('scripts/seed-auth.js', 'utf8').includes('OWNER_PASSWORD'));
  assert.ok(fs.readFileSync('scripts/seed-services.js', 'utf8').includes('DEFAULT_TENANT_ID'));
  console.log('Sprint 738 Supabase company provisioning test passed.');
})().catch(error => { console.error(error); process.exit(1); });
