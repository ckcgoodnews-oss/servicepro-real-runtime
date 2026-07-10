const fs = require('fs');

const required = [
  'apps/api/src/services/pricingService.js',
  'apps/api/src/repositories/estimateRepository.js',
  'apps/api/src/repositories/invoiceRepository.js',
  'apps/api/src/routes/estimates.js',
  'apps/api/src/routes/invoices.js',
  'packages/database/postgres/057_estimates_invoices_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 57 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint57.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-57';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { calculateLines } = require('../apps/api/src/services/pricingService');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const calc = calculateLines([
  { name: 'Drain cleaning', quantity: 1, unitPrice: 225, unitCost: 85, taxable: true }
], 0.07);

if (calc.total !== 240.75) {
  console.error(`Pricing calculation failed. Expected 240.75, got ${calc.total}`);
  process.exit(1);
}

const estimate = repos.estimates.create('tenant_demo', {
  customerId: 'cust_demo_1',
  jobId: 'job_demo_1',
  taxRate: 0.07,
  lines: [{ name: 'Drain cleaning', quantity: 1, unitPrice: 225, unitCost: 85, taxable: true }]
});

if (!estimate.id || estimate.total !== 240.75) {
  console.error('Estimate create failed.');
  process.exit(1);
}

const invoice = repos.invoices.create('tenant_demo', {
  customerId: 'cust_demo_1',
  jobId: 'job_demo_1',
  taxRate: 0.07,
  paidAmount: 100,
  lines: [{ name: 'Drain cleaning', quantity: 1, unitPrice: 225, unitCost: 85, taxable: true }]
});

if (!invoice.id || invoice.balanceDue !== 140.75) {
  console.error('Invoice create failed.');
  process.exit(1);
}

const ownerPermissions = permissionsForRoles(['owner']);
if (!ownerPermissions.includes(PERMISSIONS.ESTIMATES_WRITE) || !ownerPermissions.includes(PERMISSIONS.INVOICES_WRITE)) {
  console.error('Owner missing estimate/invoice permissions.');
  process.exit(1);
}

console.log('Sprint 57 estimates/invoices runtime patch test passed.');
