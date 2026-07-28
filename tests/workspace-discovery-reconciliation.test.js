const assert = require('node:assert/strict');
const test = require('node:test');
const { createWorkspaceRepository } = require('../apps/api/src/repositories/workspaceRepository');

test('workspace dropdown reconciles registered, configured, and owner-backed tenants', () => {
  let state = {
    tenants: [
      { id: 'workspace-demo', tenantKey: 'tenant_demo', name: 'Demo Plumbing' }
    ],
    tenantSettings: [
      { tenantId: 'tenant_settings_only', companyName: 'Settings Company' }
    ],
    users: [
      { id: 'owner-1', tenantId: 'tenant_owner_only', name: 'Owner Company', email: 'owner@example.com', roles: ['owner'] },
      { id: 'staff-1', tenantId: 'tenant_staff_only', name: 'Staff User', email: 'staff@example.com', roles: ['technician'] }
    ],
    tenantAdminRecords: [
      { tenantId: 'tenant_admin_only', name: 'Admin Record Company' }
    ]
  };
  const store = {
    type: 'json',
    read: () => structuredClone(state),
    write: next => { state = structuredClone(next); }
  };
  const workspaces = createWorkspaceRepository(store);
  const rows = workspaces.list();

  assert.deepEqual(
    rows.map(row => row.tenantId).sort(),
    ['tenant_admin_only', 'tenant_demo', 'tenant_owner_only', 'tenant_settings_only']
  );
  assert.equal(workspaces.find('tenant_owner_only').name, 'Owner Company');
  assert.equal(workspaces.find('tenant_staff_only'), null);
});
