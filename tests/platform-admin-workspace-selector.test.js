const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

test('authenticated requests use the selected workspace tenant ID', () => {
  const session = read('apps/web/src/auth/session.ts');

  assert.match(session, /headers\.set\('x-tenant-id', tenantId\(\)\)/);
  assert.doesNotMatch(
    session,
    /headers\.set\('x-tenant-id', session\?\.user\.tenantId \|\| tenantId\(\)\)/
  );
});

test('workspace selector persists the selected tenant and reports switch failures', () => {
  const selector = read('apps/web/src/components/WorkspaceHeader.tsx');

  assert.match(selector, /setActiveTenantId\(nextTenantId\)/);
  assert.match(selector, /window\.location\.reload\(\)/);
  assert.match(selector, /role="alert"/);
  assert.match(selector, /Unable to switch company/);
});
