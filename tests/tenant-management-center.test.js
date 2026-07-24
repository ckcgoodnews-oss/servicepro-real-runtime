const assert = require('node:assert/strict');
const test = require('node:test');
const tenantManagement = require('../apps/api/src/routes/tenantManagement');
const { createJsonStore } = require('../apps/api/src/store/jsonStoreAdapter');
const { createRepositories } = require('../apps/api/src/repositories/repositoryFactory');

function response() {
  return { setHeader() {}, end(value) { this.body = JSON.parse(value); } };
}

function request(repositories, email = '5189213@gmail.com') {
  return {
    body: {},
    context: { email, userId: 'platform-admin-id', repositories }
  };
}

test('tenant management center blocks non-platform administrators', async () => {
  const store = createJsonStore();
  store.reset();
  const repositories = createRepositories(store);
  const res = response();
  await tenantManagement.list(request(repositories, 'owner@example.com'), res);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error.code, 'platform_admin_required');
});

test('platform administrators can manage tenant operating records', async () => {
  const store = createJsonStore();
  store.reset();
  const repositories = createRepositories(store);
  let res = response();

  await tenantManagement.list(request(repositories), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data[0].tenantId, 'tenant_demo');
  assert.ok(res.body.data[0].usage.customers >= 1);

  const req = request(repositories);
  req.body = { status: 'suspended', plan: 'growth', tags: ['priority'], notes: 'Billing review scheduled' };
  res = response();
  await tenantManagement.update(req, res, 'tenant_demo');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'suspended');

  req.body = { domain: 'plumber.example.com' };
  res = response();
  await tenantManagement.saveDomain(req, res, 'tenant_demo');
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.data.domain, 'plumber.example.com');

  req.body = { name: 'Dispatch integration' };
  res = response();
  await tenantManagement.createApiKey(req, res, 'tenant_demo');
  assert.equal(res.statusCode, 201);
  assert.match(res.body.data.token, /^spk_/);
  assert.equal(res.body.data.name, 'Dispatch integration');

  res = response();
  await tenantManagement.audit(request(repositories), res, 'tenant_demo');
  assert.equal(res.statusCode, 200);
  assert.ok(res.body.data.some(event => event.action === 'api_key.create'));
});

test('platform administrators can soft-delete and restore tenants', async () => {
  const store = createJsonStore();
  store.reset();
  const repositories = createRepositories(store);
  let res = response();

  await tenantManagement.action(request(repositories), res, 'tenant_demo', 'soft-delete');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'deleted');

  res = response();
  await tenantManagement.action(request(repositories), res, 'tenant_demo', 'restore');
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'active');
});
