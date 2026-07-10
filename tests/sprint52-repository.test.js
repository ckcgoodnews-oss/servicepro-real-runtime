const fs = require('fs');

const required = [
  'apps/api/src/store/storeProvider.js',
  'apps/api/src/store/jsonStoreAdapter.js',
  'apps/api/src/store/postgresStoreAdapter.js',
  'apps/api/src/repositories/customerRepository.js',
  'apps/api/src/repositories/jobRepository.js',
  'apps/api/src/repositories/repositoryFactory.js',
  'packages/database/postgres/052_runtime_store.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 52 file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint52.json';

const { createRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const repos = createRepositories();
repos.store.reset();

const customer = repos.customers.create('tenant_demo', {
  firstName: 'Repo',
  lastName: 'Customer',
  email: 'repo@example.com'
});

if (!customer.id) {
  console.error('Customer repository create failed.');
  process.exit(1);
}

const job = repos.jobs.create('tenant_demo', {
  title: 'Repository test job',
  customerId: customer.id
});

if (!job.id) {
  console.error('Job repository create failed.');
  process.exit(1);
}

console.log('Sprint 52 repository foundation test passed.');
