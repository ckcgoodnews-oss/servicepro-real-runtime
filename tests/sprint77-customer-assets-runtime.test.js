const fs = require('fs');

const required = [
  'apps/api/src/services/customerAssetService.js',
  'apps/api/src/repositories/customerAssetRepository.js',
  'apps/api/src/repositories/assetServiceHistoryRepository.js',
  'apps/api/src/routes/customerAssets.js',
  'packages/database/postgres/077_customer_assets_runtime.sql',
  'docs/sprint77-customer-assets-runtime.md'
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required Sprint 77 patch file: ${file}`);
    process.exit(1);
  }
}

const { isWarrantyActive, assetAgeYears, normalizeAssetInput } = require('../apps/api/src/services/customerAssetService');

const asset = normalizeAssetInput({
  customerId: 'cust_demo_1',
  assetType: 'water_heater',
  name: 'Basement water heater',
  installedDate: '2024-01-01',
  warrantyExpiresAt: '2029-01-01'
});

if (!isWarrantyActive(asset, '2026-01-01')) {
  console.error('Warranty helper failed.');
  process.exit(1);
}
if (assetAgeYears(asset, '2026-01-01') !== 2) {
  console.error('Asset age helper failed.');
  process.exit(1);
}

console.log('Sprint 77 customer assets runtime patch test passed.');
