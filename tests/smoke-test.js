const http = require('http');
const { router } = require('../apps/api/src/router');

const server = http.createServer(async (req, res) => {
  try { await router(req, res); }
  catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
});

function get(port, path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${path}`, { headers: { 'x-tenant-id': 'tenant_demo' } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

function post(port, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(`http://localhost:${port}${path}`, {
      method: 'POST',
      headers: { 'x-tenant-id': 'tenant_demo', 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject); req.end(data);
  });
}

server.listen(0, async () => {
  const port = server.address().port;
  let pass = 0, fail = 0;

  const tests = [
    ['GET /healthz returns 200', async () => { const r = await get(port, '/healthz'); if (r.status !== 200) throw new Error('got ' + r.status); }],
    ['GET /readyz returns 200', async () => { const r = await get(port, '/readyz'); if (r.status !== 200) throw new Error('got ' + r.status); }],
    ['Auth required for /api/v1/customers', async () => { const r = await get(port, '/api/v1/customers'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Auth required for /api/v1/jobs', async () => { const r = await get(port, '/api/v1/jobs'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Auth required for /api/v1/dispatch', async () => { const r = await get(port, '/api/v1/dispatch'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Auth required for /api/v1/inventory', async () => { const r = await get(port, '/api/v1/inventory'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Auth required for /api/v1/technicians', async () => { const r = await get(port, '/api/v1/technicians'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Auth required for /api/v1/services', async () => { const r = await get(port, '/api/v1/services'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Portal login validates input', async () => { const r = await post(port, '/portal/login', {}); if (r.status !== 400) throw new Error('got ' + r.status); }],
    ['TMC dashboard requires auth', async () => { const r = await get(port, '/api/v1/platform/tmc/dashboard'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['TMC tenants requires auth', async () => { const r = await get(port, '/api/v1/platform/tenant-management'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Unknown authenticated route returns 401 (auth-first pattern)', async () => { const r = await get(port, '/api/v1/nonexistent-xyz'); if (r.status !== 401) throw new Error('got ' + r.status); }],
    ['Auth register validates', async () => { const r = await post(port, '/auth/register', {}); if (![400, 422].includes(r.status)) throw new Error('got ' + r.status); }],
    ['Auth login validates', async () => { const r = await post(port, '/auth/login', {}); if (![400, 401].includes(r.status)) throw new Error('got ' + r.status); }],
    ['Public storefront 404 for unknown', async () => { const r = await get(port, '/api/public/storefront/nonexistent-business-xyz'); if (r.status !== 404) throw new Error('got ' + r.status); }],
    ['CORS preflight returns 204', async () => {
      const r = await new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:${port}/api/v1/customers`, { method: 'OPTIONS', headers: { 'origin': 'http://localhost:3000', 'access-control-request-method': 'GET' } }, res => {
          let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode }));
        }); req.on('error', reject); req.end();
      });
      if (r.status !== 204) throw new Error('got ' + r.status);
    }],
  ];

  for (const [name, fn] of tests) {
    try { await fn(); pass++; console.log('  PASS', name); }
    catch (e) { fail++; console.log('  FAIL', name, '-', e.message); }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`  ${pass} passed, ${fail} failed (${tests.length} total)`);
  console.log('='.repeat(50));
  server.close();
  process.exit(fail ? 1 : 0);
});
