const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createOrganizationUnitRepository, TYPES } = require('../apps/api/src/repositories/organizationUnitRepository');

let state = { organizationUnits: [] };
const repository = createOrganizationUnitRepository({ type: 'json', read: () => structuredClone(state), write: data => { state = structuredClone(data); } });
const root = repository.create('tenant_a', { type: 'organization', name: 'Aardvark Services', code: 'AS' });
const department = repository.create('tenant_a', { type: 'department', name: 'Field Operations', parentId: root.id });
repository.create('tenant_b', { type: 'team', name: 'Other tenant team' });
assert.deepStrictEqual(TYPES, ['organization', 'business_unit', 'department', 'location', 'team']);
assert.strictEqual(repository.list('tenant_a').length, 2);
assert.strictEqual(repository.list('tenant_b').length, 1);
assert.strictEqual(repository.update('tenant_a', department.id, { name: 'Service Operations' }).name, 'Service Operations');
assert.throws(() => repository.delete('tenant_a', root.id), /child units/);
assert.strictEqual(repository.delete('tenant_a', department.id), true);
assert.strictEqual(repository.delete('tenant_a', root.id), true);

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
assert.match(read('apps/api/src/router.js'), /ORGANIZATION_READ/);
assert.match(read('apps/web/src/components/OrganizationWorkspace.tsx'), /Organizations/);
assert.match(read('packages/database/postgres/721_organization_management.sql'), /organization_units/);
console.log('Sprint 721 organization management test passed.');
