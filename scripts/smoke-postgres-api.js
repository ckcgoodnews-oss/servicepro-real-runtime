const path = require('path');
const { spawn } = require('child_process');

const port = Number(process.env.POSTGRES_SMOKE_PORT || 11039);
const tenantId = process.env.DEFAULT_TENANT_ID || 'tenant_demo';
const email = process.env.OWNER_EMAIL || 'owner@example.com';
const password = process.env.OWNER_PASSWORD || 'ChangeMe123!';

for (const key of ['DATABASE_URL', 'JWT_SECRET', 'PORTAL_TOKEN_SECRET']) {
  if (!process.env[key]) {
    console.error(`PostgreSQL API smoke test requires ${key}.`);
    process.exit(1);
  }
}

const server = spawn(process.execPath, ['apps/api/src/server.js'], {
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
    DATA_STORE: 'postgres',
    DEFAULT_TENANT_ID: tenantId,
    CORS_ALLOWED_ORIGINS: 'https://postgres-smoke.servicepro.invalid'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stderr = '';
server.stderr.on('data', chunk => { stderr += chunk.toString(); });

async function request(pathname, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    return await fetch(`http://127.0.0.1:${port}${pathname}`, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForReadiness() {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await request('/readyz');
      const body = await response.json();
      if (response.ok && body.ready === true && body.store === 'postgres' && body.checks?.dataStore === true) return body;
      lastError = new Error(`Readiness returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw lastError || new Error('PostgreSQL API readiness timed out');
}

async function verifyLogin() {
  const response = await request('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
    body: JSON.stringify({ email, password })
  });
  const body = await response.json();
  if (!response.ok || !body.data?.accessToken || body.data?.user?.tenantId !== tenantId) {
    throw new Error(`PostgreSQL login failed with status ${response.status}`);
  }

  const dashboard = await request('/api/v1/dashboard/summary', {
    headers: { authorization: `Bearer ${body.data.accessToken}`, 'x-tenant-id': tenantId }
  });
  if (!dashboard.ok) throw new Error(`Authenticated PostgreSQL dashboard returned ${dashboard.status}`);
}

(async () => {
  try {
    await waitForReadiness();
    await verifyLogin();
    console.log(`PostgreSQL API smoke test passed: ready=true, store=postgres, tenant=${tenantId}, login=true.`);
  } catch (error) {
    console.error(stderr || error.message);
    process.exitCode = 1;
  } finally {
    server.kill();
  }
})();
