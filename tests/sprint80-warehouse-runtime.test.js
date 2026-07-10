const fs = require('fs');

const required = [
  'apps/api/src/services/warehouseService.js',
  'apps/api/src/repositories/warehouseRepository.js',
  'apps/api/src/repositories/inventoryTransferRepository.js',
  'apps/api/src/routes/warehouses.js',
  'scripts/seed-warehouse.js',
  'packages/database/postgres/080_warehouse_runtime.sql',
  'docs/sprint80-warehouse-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 80 patch file: ${file}`);
    process.exit(1);
  }
}

const {
  normalizeWarehouseInput,
  normalizeBinInput,
  normalizeTransferInput,
  transferLineTotalQuantity
} = require('../apps/api/src/services/warehouseService');

const warehouse = normalizeWarehouseInput({ name: 'Main Warehouse' });
if (warehouse.code !== 'MAIN-WAREHOUSE') {
  console.error('Warehouse normalization failed.');
  process.exit(1);
}

const bin = normalizeBinInput({ warehouseId: 'wh1', code: 'A-01' });
if (bin.name !== 'A-01') {
  console.error('Bin normalization failed.');
  process.exit(1);
}

const transfer = normalizeTransferInput({
  fromWarehouseId: 'wh1',
  toWarehouseId: 'wh2',
  lines: [{ sku: 'PVC', quantity: 3 }]
});

if (transferLineTotalQuantity(transfer.lines) !== 3) {
  console.error('Transfer total quantity failed.');
  process.exit(1);
}

console.log('Sprint 80 warehouse runtime patch test passed.');
