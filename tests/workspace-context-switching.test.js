const assert = require('node:assert/strict');
const test = require('node:test');
const { authGuard } = require('../apps/api/src/middleware/authGuard');
const { issueAccessToken } = require('../apps/api/src/services/tokenService');

function response() {
  return { setHeader() {}, end(value) { this.body = JSON.parse(value); } };
}

function request(token, requestedTenant) {
  return {
    headers: { authorization: `Bearer ${token}` },
    context: {
      tenantId: requestedTenant,
      repositories: {
        workspaces: {
          async find(tenantId) {
            return tenantId === 'tenant_business_b' ? { id: 'workspace-b', tenantId, name: 'Business B' } : null;
          }
        },
        authSessions: { async isActive() { return true; } }
      }
    }
  };
}

test('non-admin cannot forge a different workspace header', async () => {
  const token = issueAccessToken({ userId:'owner-1', tenantId:'tenant_business_a', email:'owner@example.com', roles:['owner'] });
  const req = request(token, 'tenant_business_b');
  const res = response();
  assert.equal(await authGuard(req,res), false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error.message, 'Token tenant does not match request tenant');
});

test('allowlisted platform admin can switch to an existing workspace', async () => {
  const token = issueAccessToken({ userId:'admin-1', tenantId:'tenant_demo', email:'5189213@gmail.com', roles:['owner','admin'] });
  const req = request(token, 'tenant_business_b');
  const res = response();
  assert.equal(await authGuard(req,res), true);
  assert.equal(req.context.tenantId, 'tenant_business_b');
  assert.equal(req.context.authTenantId, 'tenant_demo');
  assert.equal(req.context.workspace.name, 'Business B');
});

test('platform admin cannot switch to a nonexistent workspace', async () => {
  const token = issueAccessToken({ userId:'admin-1', tenantId:'tenant_demo', email:'5189213@gmail.com', roles:['owner','admin'] });
  const req = request(token, 'tenant_missing');
  const res = response();
  assert.equal(await authGuard(req,res), false);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error.code, 'workspace_not_found');
});
