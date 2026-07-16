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
console.log('Sprint 739 PostgreSQL certification gate test passed.');
