const fs = require('fs');

const requiredFiles = [
  'packages/customers/src/customerService.ts',
  'packages/jobs/src/jobService.ts',
  'packages/estimates/src/estimateService.ts',
  'packages/invoices/src/invoiceService.ts',
  'packages/dispatch/src/dispatchService.ts',
  'packages/pricing/src/pricingCalculator.ts',
  'packages/shared/src/domainEvents.ts',
  'packages/database/postgres/044_core_service_metadata.sql'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 44 file: ${file}`);
    process.exit(1);
  }
}

console.log('Sprint 44 core services foundation test passed.');
