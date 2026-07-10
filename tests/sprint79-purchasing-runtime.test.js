const fs = require('fs');

const required = [
  'apps/api/src/services/purchasingService.js',
  'apps/api/src/repositories/vendorRepository.js',
  'apps/api/src/repositories/purchaseOrderRepository.js',
  'apps/api/src/routes/purchasing.js',
  'scripts/seed-purchasing.js',
  'packages/database/postgres/079_purchasing_runtime.sql',
  'docs/sprint79-purchasing-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 79 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeVendorInput,
  normalizePurchaseOrderInput,
  calculatePurchaseOrderSubtotal,
  calculateReceivedStatus,
  applyReceivingToLines
} = require('../apps/api/src/services/purchasingService');

const vendor = normalizeVendorInput({ name: 'Demo Supply' });
if (vendor.paymentTerms !== 'Net 30') {
  console.error('Vendor normalization failed.');
  process.exit(1);
}

const po = normalizePurchaseOrderInput({
  vendorId: 'vendor_1',
  lines: [
    { sku: 'PVC', description: 'PVC trap', quantity: 10, unitCost: 4.25 }
  ]
});

if (po.total !== 42.5 || calculatePurchaseOrderSubtotal(po.lines) !== 42.5) {
  console.error('Purchase order total failed.');
  process.exit(1);
}

let lines = applyReceivingToLines(po.lines, [{ sku: 'PVC', quantity: 4 }]);
if (calculateReceivedStatus(lines) !== 'partially_received') {
  console.error('Partial receiving failed.');
  process.exit(1);
}

lines = applyReceivingToLines(lines, [{ sku: 'PVC', quantity: 6 }]);
if (calculateReceivedStatus(lines) !== 'received') {
  console.error('Full receiving failed.');
  process.exit(1);
}

console.log('Sprint 79 purchasing runtime patch test passed.');
