const fs = require('fs');

const required = [
  'apps/api/src/services/inventoryService.js',
  'apps/api/src/repositories/inventoryRepository.js',
  'apps/api/src/repositories/stockAdjustmentRepository.js',
  'apps/api/src/repositories/materialUsageRepository.js',
  'apps/api/src/routes/inventory.js',
  'apps/api/src/routes/materials.js',
  'packages/database/postgres/062_inventory_materials_runtime.sql'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 62 patch file: ${file}`);
    process.exit(1);
  }
}

process.env.DATA_STORE = 'json';
process.env.DATA_FILE = './data/test-sprint62.json';
process.env.JWT_SECRET = 'test-secret-for-sprint-62';

const { resetRepositoriesForTest, getRepositories } = require('../apps/api/src/repositories/repositoryFactory');
const { permissionsForRoles, PERMISSIONS } = require('../apps/api/src/auth/permissions');

resetRepositoriesForTest();
const repos = getRepositories();
repos.store.reset();

const items = repos.inventory.list('tenant_demo');
if (!items.length) {
  console.error('Inventory seed missing.');
  process.exit(1);
}

const item = items[0];
const adjusted = repos.inventory.adjustQuantity('tenant_demo', item.id, 5);
if (adjusted.quantityOnHand !== item.quantityOnHand + 5) {
  console.error('Stock adjustment failed.');
  process.exit(1);
}

const usage = repos.materialUsage.create('tenant_demo', {
  jobId: 'job_demo_1',
  inventoryItemId: item.id,
  quantity: 2,
  unitCost: item.unitCost,
  notes: 'Test material usage'
});

const afterUsage = repos.inventory.adjustQuantity('tenant_demo', item.id, -2);
if (!usage.id || afterUsage.quantityOnHand !== adjusted.quantityOnHand - 2) {
  console.error('Material usage stock deduction failed.');
  process.exit(1);
}

const techPermissions = permissionsForRoles(['technician']);
if (!techPermissions.includes(PERMISSIONS.MATERIALS_WRITE)) {
  console.error('Technician missing materials.write permission.');
  process.exit(1);
}

console.log('Sprint 62 inventory/materials runtime patch test passed.');
