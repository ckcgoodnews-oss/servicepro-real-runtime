const assert = require('assert');
const fs = require('fs');
const http = require('http');
const { runDeployedSmoke } = require('../scripts/smoke-deployed-app');

function start(handler) {
  return new Promise(resolve => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(status === 204 ? '' : JSON.stringify(body));
}

async function close(server) {
  await new Promise(resolve => server.close(resolve));
}

async function withDeployment({ store = 'postgres', loginTenant = 'acme_plumbing' }, run) {
  const web = await start((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<h1>ServicePro</h1>');
  });
  const webUrl = `http://127.0.0.1:${web.address().port}`;
  const cors = { 'access-control-allow-origin': webUrl };
  const api = await start((req, res) => {
    if (req.url === '/healthz') return send(res, 200, { ok: true, version: '8.0.0-alpha.1' }, cors);
    if (req.url === '/readyz') return send(res, 200, { ready: true, store, checks: { configuration: true, runtime: true, dataStore: true } }, cors);
    if (req.url === '/auth/login') return send(res, 200, { data: { accessToken: 'never-log-this-token', user: { tenantId: loginTenant } } }, cors);
    if (req.url === '/api/v1/dashboard/summary') return send(res, 200, { data: { kpis: { openWork: 1 } } }, cors);
    if (req.url === '/auth/logout') return send(res, 204, {}, cors);
    return send(res, 404, { error: { message: 'missing' } }, cors);
  });
  const apiUrl = `http://127.0.0.1:${api.address().port}`;
  try {
    return await run({ webUrl, apiUrl });
  } finally {
    await Promise.all([close(web), close(api)]);
  }
}

(async () => {
  const result = await withDeployment({}, urls => runDeployedSmoke({
    ...urls,
    tenantId: 'acme_plumbing',
    email: 'owner@example.com',
    password: 'test-only-password',
    expectedStore: 'postgres',
    requireAuth: true,
    timeoutMs: 5000
  }));
  assert.strictEqual(result.ok, true);
  assert.ok(result.checks.includes('api:store:postgres'));
  assert.ok(result.checks.includes('auth:tenant'));
  assert.ok(!JSON.stringify(result).includes('never-log-this-token'));

  await assert.rejects(
    withDeployment({ store: 'json' }, urls => runDeployedSmoke({ ...urls, expectedStore: 'postgres', timeoutMs: 5000 })),
    /API is using json; expected postgres/
  );
  await assert.rejects(
    withDeployment({ loginTenant: 'wrong_company' }, urls => runDeployedSmoke({ ...urls, tenantId: 'acme_plumbing', email: 'owner@example.com', password: 'test-only-password', expectedStore: 'postgres', requireAuth: true, timeoutMs: 5000 })),
    /Login returned tenant wrong_company; expected acme_plumbing/
  );
  await assert.rejects(
    runDeployedSmoke({ expectedStore: 'sqlite' }),
    /SMOKE_EXPECTED_STORE must be json or postgres/
  );

  const workflow = fs.readFileSync('.github/workflows/online-smoke.yml', 'utf8');
  for (const contract of ['tenant_id:', 'expected_store:', 'SMOKE_TENANT_ID: ${{ inputs.tenant_id }}', 'SMOKE_EXPECTED_STORE: ${{ inputs.expected_store }}']) {
    assert.ok(workflow.includes(contract), `Online smoke workflow is missing ${contract}`);
  }
  const guide = fs.readFileSync('SUPABASE_DEPLOYMENT.md', 'utf8');
  assert.match(guide, /SMOKE_EXPECTED_STORE='postgres'/);
  assert.match(guide, /different tenant/);
  console.log('Sprint 740 persistent company deployment smoke test passed.');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
