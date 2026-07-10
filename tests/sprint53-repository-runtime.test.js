const fs = require('fs');

const required = [
  'apps/api/src/context/requestContext.js',
  'apps/api/src/router.js',
  'apps/api/src/routes/customers.js',
  'apps/api/src/routes/jobs.js',
  'apps/api/src/repositories/repositoryFactory.js',
  'packages/database/postgres/053_repository_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 53 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint53.json';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
resetRepositoriesForTest();

const repos = getRepositories();
repos.store.reset();

const customer = repos.customers.create('tenant_demo', {
  firstName: 'Patch',
  lastName: 'Customer',
  email: 'patch@example.com'
});

const job = repos.jobs.create('tenant_demo', {
  title: 'Patch job',
  customerId: customer.id
});

if (!customer.id || !job.id) {
  console.error('Repository runtime patch test failed.');
  process.exit(1);
}

console.log('Sprint 53 repository runtime patch test passed.');
