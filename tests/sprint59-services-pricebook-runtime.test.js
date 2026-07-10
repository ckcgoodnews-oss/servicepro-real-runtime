const fs = require('fs');

const required = [
  'apps/api/src/services/priceBookService.js',
  'apps/api/src/repositories/serviceRepository.js',
  'apps/api/src/routes/services.js',
  'apps/api/src/repositories/estimateRepository.js',
  'apps/api/src/repositories/invoiceRepository.js',
  'packages/database/postgres/059_services_pricebook_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 59 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint59.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-59';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { resolveServiceLines } = require('../apps/api/src/services/priceBookService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const services = repos.services.list('tenant_demo');
if (!services.some(s => s.code === 'DRAIN-CLEAN')) {
  console.error('Seed service catalog missing DRAIN-CLEAN.');
  process.exit(1);
}

const lines = resolveServiceLines([{ serviceCode: 'DRAIN-CLEAN', quantity: 2 }], services);
if (lines[0].unitPrice !== 225 || lines[0].quantity !== 2) {
  console.error('Service line resolution failed.');
  process.exit(1);
}

const estimate = repos.estimates.create('tenant_demo', {
  customerId: 'cust_demo_1',
  jobId: 'job_demo_1',
  taxRate: 0.07,
  lines: [{ serviceCode: 'DRAIN-CLEAN', quantity: 2 }]
});

if (estimate.total !== 481.5) {
  console.error(`Estimate from service code failed. Expected 481.5, got ${estimate.total}`);
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.SERVICES_WRITE)) {
  console.error('Owner missing services.write permission.');
  process.exit(1);
}

console.log('Sprint 59 services/pricebook runtime patch test passed.');
