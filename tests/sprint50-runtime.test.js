const fs = require('fs');

const required = [
  'apps/api/src/server.js',
  'apps/api/src/router.js',
  'apps/api/src/middleware/tenant.js',
  'apps/api/src/middleware/authGuard.js',
  'apps/api/src/services/customerService.js',
  'apps/api/src/services/jobService.js',
  'apps/api/src/routes/customers.js',
  'apps/api/src/routes/jobs.js',
  'packages/database/postgres/050_runtime_api.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 50 file: ${file}`);
    process.exit(1);
  }
}

const customerService = require('../apps/api/src/services/customerService');
const customers = customerService.listCustomers('tenant_demo');
if (!Array.isArray(customers) || customers.length < 1) {
  console.error('Customer service failed smoke test.');
  process.exit(1);
}

console.log('Sprint 50 runtime API foundation test passed.');
