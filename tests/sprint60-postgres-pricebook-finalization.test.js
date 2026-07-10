const fs = require('fs');

const required = [
  'apps/api/src/services/priceBookService.js',
  'apps/api/src/repositories/estimateRepository.js',
  'apps/api/src/repositories/invoiceRepository.js',
  'packages/database/postgres/060_postgres_pricebook_finalization.sql',
  'scripts/seed-services.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 60 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint60.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-60';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { resolveServiceLinesAsync } = require('../apps/api/src/services/priceBookService');

(async () => {
  resetRepositoriesForTest();
  const repos = getRepositories();
  repos.store.reset();

  const resolved = await resolveServiceLinesAsync(
    'tenant_demo',
    [{ serviceCode: 'DRAIN-CLEAN', quantity: 2 }],
    repos.services
  );

  if (resolved[0].unitPrice !== 225 || resolved[0].quantity !== 2) {
    console.error('Async service line resolution failed.');
    process.exit(1);
  }

  const estimate = await repos.estimates.create('tenant_demo', {
    customerId: 'cust_demo_1',
    jobId: 'job_demo_1',
    taxRate: 0.07,
    lines: [{ serviceCode: 'DRAIN-CLEAN', quantity: 2 }]
  });

  if (estimate.total !== 481.5) {
    console.error(`Estimate total failed. Expected 481.5, got ${estimate.total}`);
    process.exit(1);
  }

  const invoice = await repos.invoices.create('tenant_demo', {
    customerId: 'cust_demo_1',
    jobId: 'job_demo_1',
    taxRate: 0.07,
    lines: [{ serviceCode: 'WH-DIAG', quantity: 1 }]
  });

  if (invoice.total !== 159.43) {
    console.error(`Invoice total failed. Expected 159.43, got ${invoice.total}`);
    process.exit(1);
  }

  const paid = await repos.invoices.recordPayment('tenant_demo', invoice.id, 159.43);
  if (paid.status !== 'paid' || paid.balanceDue !== 0) {
    console.error('Invoice payment finalization failed.');
    process.exit(1);
  }

  console.log('Sprint 60 PostgreSQL pricebook finalization patch test passed.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
