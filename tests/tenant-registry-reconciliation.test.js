const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('PostgreSQL migration registers settings-backed and owner-backed tenant IDs', () => {
  const migration = read('packages/database/postgres/781_tenant_registry_reconciliation.sql');

  assert.match(migration, /FROM tenant_settings ts/);
  assert.match(migration, /FROM runtime_users u/);
  assert.match(migration, /u\.roles \? 'owner'/);
  assert.match(migration, /INSERT INTO tenants \(tenant_key, name\)/);
  assert.match(migration, /ON CONFLICT \(tenant_key\) DO UPDATE/);
});

test('platform tenant posture presents tenant ID as a dedicated column', () => {
  const component = read('apps/web/src/components/PlatformAdminWorkspace.tsx');

  assert.match(component, /<th>Tenant ID<\/th>/);
  assert.match(component, /<td><code>\{row\.tenantId\}<\/code><\/td>/);
  assert.match(component, /colSpan=\{7\}/);
});
