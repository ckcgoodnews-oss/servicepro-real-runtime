const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createCustomerAssetRepository } = require('../apps/api/src/repositories/customerAssetRepository');
const { createAssetServiceHistoryRepository } = require('../apps/api/src/repositories/assetServiceHistoryRepository');
const { createMediaAttachmentRepository } = require('../apps/api/src/repositories/mediaAttachmentRepository');

let state = { customerAssets: [], assetServiceHistory: [], mediaAttachments: [] };
const store = { type: 'json', read: () => structuredClone(state), write: data => { state = structuredClone(data); } };
const assets = createCustomerAssetRepository(store); const history = createAssetServiceHistoryRepository(store); const media = createMediaAttachmentRepository(store);
const asset = assets.create('tenant_a', { customerId: 'customer_a', assetType: 'water_heater', name: 'Water heater', serialNumber: 'WH-100' });
assets.create('tenant_b', { customerId: 'customer_b', assetType: 'boiler', name: 'Other tenant boiler' });
assert.strictEqual(assets.list('tenant_a').length, 1);
assert.strictEqual(assets.findById('tenant_b', asset.id), null);
assert.strictEqual(assets.update('tenant_a', asset.id, { status: 'retired' }).status, 'retired');
history.create('tenant_a', { assetId: asset.id, serviceDate: '2026-07-15', eventType: 'inspection', summary: 'Safety inspection' });
assert.strictEqual(history.listForAsset('tenant_a', asset.id).length, 1);
media.create('tenant_a', { entityType: 'asset', entityId: asset.id, filename: 'manual.pdf', mimeType: 'application/pdf' });
assert.strictEqual(media.list('tenant_a', { entityType: 'asset', entityId: asset.id }).length, 1);

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
assert.match(read('apps/api/src/router.js'), /assetAttachmentMatch/);
assert.match(read('apps/api/src/routes/customerAssets.js'), /Customer asset not found/);
assert.match(read('apps/web/src/components/AssetWorkspace.tsx'), /Service history/);
assert.match(read('apps/web/src/components/AssetWorkspace.tsx'), /Search assets/);
assert.match(read('packages/database/postgres/722_asset_management_experience.sql'), /idx_customer_assets_tenant_status_type/);
console.log('Sprint 722 asset management test passed.');
