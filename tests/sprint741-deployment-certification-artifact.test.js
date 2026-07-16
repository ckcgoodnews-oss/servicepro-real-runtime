const assert = require('assert');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { runDeployedSmoke, writeSmokeReport } = require('../scripts/smoke-deployed-app');

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

function close(server) {
  return new Promise(resolve => server.close(resolve));
}

(async () => {
  const web = await start((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<h1>ServicePro</h1>');
  });
  const webUrl = `http://127.0.0.1:${web.address().port}`;
  const cors = { 'access-control-allow-origin': webUrl };
  const api = await start((req, res) => {
    if (req.url === '/healthz') return send(res, 200, { ok: true, version: '8.0.0-alpha.1' }, cors);
    if (req.url === '/readyz') return send(res, 200, { ready: true, store: 'postgres', checks: { dataStore: true } }, cors);
    if (req.url === '/auth/login') return send(res, 200, { data: { accessToken: 'secret-token', user: { tenantId: 'acme_plumbing' } } }, cors);
    if (req.url === '/api/v1/dashboard/summary') return send(res, 200, { data: { kpis: { openWork: 1 } } }, cors);
    if (req.url === '/auth/logout') return send(res, 204, {}, cors);
    return send(res, 404, { error: { message: 'missing' } }, cors);
  });

  try {
    const result = await runDeployedSmoke({
      webUrl,
      apiUrl: `http://127.0.0.1:${api.address().port}`,
      tenantId: 'acme_plumbing',
      email: 'owner@example.com',
      password: 'never-write-this-password',
      expectedStore: 'postgres',
      expectedVersion: '8.0.0-alpha.1',
      requireAuth: true,
      timeoutMs: 5000
    });

    assert.strictEqual(result.tenantId, 'acme_plumbing');
    assert.strictEqual(result.store, 'postgres');
    assert.strictEqual(result.version, '8.0.0-alpha.1');
    assert.match(result.checkedAt, /^\d{4}-\d{2}-\d{2}T/);

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'servicepro-certification-'));
    const reportPath = path.join(directory, 'nested', 'deployment-certification.json');
    assert.strictEqual(writeSmokeReport(reportPath, result), path.resolve(reportPath));
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    assert.deepStrictEqual(report, result);
    const serialized = JSON.stringify(report);
    assert.ok(!serialized.includes('secret-token'));
    assert.ok(!serialized.includes('never-write-this-password'));
    assert.ok(!serialized.includes('owner@example.com'));

    const workflow = fs.readFileSync('.github/workflows/online-smoke.yml', 'utf8');
    for (const contract of [
      'SMOKE_REPORT_PATH: reports/online-smoke/deployment-certification.json',
      'actions/upload-artifact@v4',
      'deployment-certification-${{ github.run_id }}',
      'retention-days: 30'
    ]) assert.ok(workflow.includes(contract), `Online smoke workflow is missing ${contract}`);

    const guide = fs.readFileSync('SUPABASE_DEPLOYMENT.md', 'utf8');
    assert.match(guide, /SMOKE_REPORT_PATH/);
    assert.match(guide, /sanitized certification report/);
    console.log('Sprint 741 deployment certification artifact test passed.');
  } finally {
    await Promise.all([close(web), close(api)]);
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
