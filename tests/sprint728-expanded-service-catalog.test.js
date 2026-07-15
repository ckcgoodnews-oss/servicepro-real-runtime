const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'servicepro-marketplace-'));
process.env.DATA_FILE = path.join(tempDirectory, 'runtime.json');

const { defaultMarketplaceItems } = require('../apps/api/src/data/serviceMarketplaceCatalog');
const { createJsonStore } = require('../apps/api/src/store/jsonStoreAdapter');

const catalog = defaultMarketplaceItems('2026-07-15T00:00:00.000Z');
const packs = catalog.filter(item => item.itemType === 'service_pack');
assert.strictEqual(packs.length, 30);
assert.strictEqual(new Set(catalog.map(item => item.code)).size, catalog.length);

for (const trade of [
  'Electrical Contractor Pack', 'Residential Cleaning Pack', 'Commercial Janitorial Pack',
  'Pest Control Pack', 'Roofing Contractor Pack', 'Garage Door Service Pack',
  'Appliance Repair Pack', 'Painting Contractor Pack', 'Pool & Spa Service Pack',
  'Tree Care & Arborist Pack', 'Septic & Wastewater Pack', 'Solar Service Pack',
  'Restoration & Remediation Pack', 'Moving Services Pack', 'Property Maintenance Pack'
]) assert.ok(packs.some(item => item.name === trade), `${trade} should be available`);

fs.writeFileSync(process.env.DATA_FILE, JSON.stringify({
  serviceMarketplaceItems: [catalog.find(item => item.code === 'pack-plumbing')],
  serviceMarketplaceInstallations: [{ id: 'existing-installation', tenantId: 'tenant_a', itemId: 'market_plumbing' }]
}));
const upgraded = createJsonStore().read();
assert.strictEqual(upgraded.serviceMarketplaceItems.length, catalog.length);
assert.strictEqual(upgraded.serviceMarketplaceInstallations.length, 1);

const component = fs.readFileSync(path.join(__dirname, '..', 'apps/web/src/components/MarketplaceWorkspace.tsx'), 'utf8');
assert.match(component, /new Set\(items\.flatMap/);
assert.match(component, /localeCompare/);
const migration = fs.readFileSync(path.join(__dirname, '..', 'packages/database/postgres/728_expanded_service_catalog.sql'), 'utf8');
assert.match(migration, /pack-electrical/);
assert.match(migration, /pack-property-maintenance/);
assert.match(migration, /ON CONFLICT\(code\) DO NOTHING/);

fs.rmSync(tempDirectory, { recursive: true, force: true });
console.log('Sprint 728 expanded service catalog test passed.');
