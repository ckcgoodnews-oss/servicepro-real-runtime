const assert = require('assert');
const fs = require('fs');

const workflow = fs.readFileSync('.github/workflows/postgres-smoke.yml', 'utf8');
for (const contract of [
  'codex/sprint-716-frontend-foundation',
  'postgres:16-alpine',
  'npm ci',
  'npm run migrations:check',
  'npm run migrate',
  'npm run seed:auth',
  'npm run seed:services',
  'npm run deploy:smoke:postgres'
]) assert.ok(workflow.includes(contract), `PostgreSQL workflow is missing ${contract}`);

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert.strictEqual(pkg.scripts['deploy:smoke:postgres'], 'node scripts/smoke-postgres-api.js');
assert.strictEqual(pkg.scripts['seed:services'], 'node scripts/seed-services.js');

const smoke = fs.readFileSync('scripts/smoke-postgres-api.js', 'utf8');
for (const contract of ["DATA_STORE: 'postgres'", '/readyz', "body.store === 'postgres'", '/auth/login', '/api/v1/dashboard/summary']) {
  assert.ok(smoke.includes(contract), `PostgreSQL API smoke is missing ${contract}`);
}
assert.ok(!smoke.includes('console.log(password)'));
assert.ok(!smoke.includes('console.log(body.data.accessToken)'));

for (const migration of ['055_auth_runtime.sql', '063_customer_portal_runtime.sql']) {
  const source = fs.readFileSync(`packages/database/postgres/${migration}`, 'utf8');
  assert.ok(!/UNIQUE\s*\([^)]*lower\s*\(/i.test(source), `${migration} must use a unique expression index`);
  assert.match(source, /CREATE UNIQUE INDEX/i);
}
assert.match(fs.readFileSync('scripts/run-migrations.js', 'utf8'), /PostgreSQL migration failure/);
const runtimeMigration = fs.readFileSync('packages/database/postgres/054_postgres_runtime.sql', 'utf8');
assert.match(runtimeMigration, /ALTER TABLE customers ALTER COLUMN tenant_id TYPE text USING tenant_id::text/);
assert.match(runtimeMigration, /ALTER TABLE jobs ALTER COLUMN tenant_id TYPE text USING tenant_id::text/);
const integrityMigration = fs.readFileSync('packages/database/postgres/070_validation_integrity_runtime.sql', 'utf8');
assert.ok(!integrityMigration.includes('ADD CONSTRAINT IF NOT EXISTS'));
assert.match(integrityMigration, /SELECT 1 FROM pg_constraint/);
const routeMigration = fs.readFileSync('packages/database/postgres/088_route_planning_runtime.sql', 'utf8');
assert.match(routeMigration, /ALTER TABLE route_plans ALTER COLUMN tenant_id TYPE text USING tenant_id::text/);
for (const column of ['technician_id', 'territory_id', 'total_distance_miles', 'metadata', 'created_at']) {
  assert.ok(routeMigration.includes(`ADD COLUMN IF NOT EXISTS ${column}`), `Route migration must upgrade ${column}`);
}
const slaMigration = fs.readFileSync('packages/database/postgres/089_sla_runtime.sql', 'utf8');
assert.match(slaMigration, /RENAME COLUMN completion_minutes TO resolution_minutes/);
assert.match(slaMigration, /ALTER COLUMN tenant_id TYPE text USING tenant_id::text/);
for (const column of ['name', 'active', 'metadata', 'created_at']) assert.ok(slaMigration.includes(`ADD COLUMN IF NOT EXISTS ${column}`));
const observabilityMigration = fs.readFileSync('packages/database/postgres/104_observability_incident_runtime.sql', 'utf8');
assert.match(observabilityMigration, /evaluation_window text NOT NULL DEFAULT '30d'/);
assert.ok(!/^\s*window\s+text/im.test(observabilityMigration), 'Observability migration must not use the reserved window identifier');
const observabilityRepository = fs.readFileSync('apps/api/src/repositories/observabilityRepository.js', 'utf8');
assert.match(observabilityRepository, /evaluation_window as "window"/);
console.log('Sprint 739 PostgreSQL certification gate test passed.');
