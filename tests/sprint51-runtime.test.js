const fs = require('fs');

const required = [
  'apps/api/src/store/jsonStore.js',
  'apps/api/src/services/customerService.js',
  'apps/api/src/services/jobService.js',
  'apps/api/src/routes/customers.js',
  'apps/api/src/routes/jobs.js',
  'apps/api/src/utils/validation.js',
  'packages/database/postgres/051_runtime_persistence.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 51 file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_FILE = './data/test-servicepro-runtime.json';

const { resetStore } = require('../apps/api/src/store/jsonStore');
const customerService = require('../apps/api/src/services/customerService');
const jobService = require('../apps/api/src/services/jobService');

resetStore();

const customer = customerService.createCustomer('tenant_demo', {
  firstName: 'Test',
  lastName: 'Customer',
  email: 'test@example.com'
});

if (!customer.id) {
  console.error('Customer create failed.');
  process.exit(1);
}

const updated = customerService.updateCustomer('tenant_demo', customer.id, { phone: '555-9999' });
if (updated.phone !== '555-9999') {
  console.error('Customer update failed.');
  process.exit(1);
}

const job = jobService.createJob('tenant_demo', { title: 'Test job', customerId: customer.id });
if (!job.id) {
  console.error('Job create failed.');
  process.exit(1);
}

const deleted = jobService.deleteJob('tenant_demo', job.id);
if (!deleted) {
  console.error('Job delete failed.');
  process.exit(1);
}

console.log('Sprint 51 runtime persistence test passed.');
