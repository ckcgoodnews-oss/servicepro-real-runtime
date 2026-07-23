const assert = require('node:assert/strict');
const test = require('node:test');
const platformAccess = require('../apps/api/src/routes/platformAccess');

function response() {
  return {setHeader() {}, end(value) { this.body = JSON.parse(value); }};
}

function request() {
  return {
    body: {tenantId: 'tenant_demo', days: 30},
    context: {
      email: '5189213@gmail.com',
      userId: 'platform-admin-id',
      repositories: {
        users: {
          async create(input) { return {id: 'new-owner-id', ...input}; }
        },
        moduleAccess: {
          async setTenantModules(tenantId, modules) { return {tenantId, modules}; }
        },
        serviceMarketplace: {
          async listCatalog() { return [{id:'pack-plumbing',name:'Plumbing',itemType:'service_pack'}]; },
          async listInstallations() { return []; },
          async install(tenantId,input) { return {id:'installation-id',tenantId,...input,status:'active'}; },
          async uninstall() { return true; }
        },
        accessEntitlements: {
          async listOwners() {
            return [
              {id: 'platform-admin-id', tenantId: 'tenant_demo', email: '5189213@gmail.com'},
              {id: 'business-owner-id', tenantId: 'tenant_demo', email: 'owner@example.com'}
            ];
          },
          async issue(input) { return {id: 'entitlement-id', ...input, status: 'pending'}; }
        }
      }
    }
  };
}

test('platform administrators are excluded from owner provisioning', async () => {
  const owners = await platformAccess.eligibleOwners(request());
  assert.deepEqual(owners.map(owner => owner.email), ['owner@example.com']);
});

test('cannot issue an owner token to a platform administrator', async () => {
  const res = response();
  await platformAccess.issue(request(), res, 'platform-admin-id');
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.code, 'invalid_owner');
});

test('platform administrator can create a tenant owner', async () => {
  const req = request();
  req.body = {tenantId: 'tenant_demo', email: 'new.owner@example.com', name: 'New Owner', password: 'StrongPass123!', modules: ['operations', 'billing', 'invalid'], siteTypeItemId:'pack-plumbing'};
  const res = response();
  await platformAccess.createOwner(req, res);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body.data.roles, ['owner']);
  assert.deepEqual(res.body.data.enabledModules, ['operations', 'billing']);
  assert.equal(res.body.data.siteTypeItemId, 'pack-plumbing');
});

test('platform administrator can change a tenant service-company site type', async () => {
  const req=request();req.body={itemId:'pack-plumbing'};const res=response();
  await platformAccess.setSiteType(req,res,'tenant_demo');
  assert.equal(res.statusCode,200);
  assert.equal(res.body.data.siteType.id,'pack-plumbing');
});
