const fs = require('fs');

const required = [
  'apps/api/src/store/postgresStoreAdapter.js',
  'apps/api/src/repositories/customerRepository.js',
  'apps/api/src/repositories/jobRepository.js',
  'packages/database/postgres/054_postgres_runtime.sql',
  'scripts/run-migrations.js',
  'scripts/seed-postgres.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 54 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint54.json';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
resetRepositoriesForTest();

const repos = getRepositories();
repos.store.reset();

const customer = repos.customers.create('tenant_demo', {
  firstName: 'Sprint54',
  lastName: 'Customer',
  email: 'sprint54@example.com'
});

if (!customer.id) {
  console.error('JSON compatibility failed after Sprint 54 patch.');
  process.exit(1);
}

console.log('Sprint 54 PostgreSQL runtime patch structure test passed.');
