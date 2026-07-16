const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const port = 11037;
const dataFile = path.join(os.tmpdir(), `servicepro-online-smoke-${process.pid}.json`);
const server = spawn(process.execPath, ['apps/api/src/server.js'], {
  cwd: path.resolve(__dirname, '..'),
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
    DEFAULT_TENANT_ID: 'tenant_demo',
    DATA_STORE: 'json',
    DATA_FILE: dataFile,
    CORS_ALLOWED_ORIGINS: 'https://servicepro-web-alpha-ckcgoodnews.onrender.com',
    JWT_SECRET: 'online-smoke-jwt-secret-at-least-32-characters',
    PORTAL_TOKEN_SECRET: 'online-smoke-portal-secret-at-least-32-characters'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});

let stderr = '';
server.stderr.on('data', chunk => { stderr += chunk.toString(); });

async function waitForHealth() {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const [healthResponse,readinessResponse] = await Promise.all([fetch(`http://127.0.0.1:${port}/healthz`),fetch(`http://127.0.0.1:${port}/readyz`)]);
      const [health,readiness] = await Promise.all([healthResponse.json(),readinessResponse.json()]);
      if (healthResponse.ok && readinessResponse.ok && health.ok === true && readiness.ready === true) return { health, readiness };
      lastError = new Error(`Health checks returned ${healthResponse.status}/${readinessResponse.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw lastError || new Error('API health check timed out');
}

async function verifyFreshDemoLogin() {
  const response = await fetch(`http://127.0.0.1:${port}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-tenant-id': 'tenant_demo' },
    body: JSON.stringify({ email: 'owner@example.com', password: 'ChangeMe123!' })
  });
  const body = await response.json();
  if (!response.ok || !body.data?.accessToken || body.data?.user?.email !== 'owner@example.com') {
    throw new Error(`Fresh demo login failed with status ${response.status}`);
  }
}

(async () => {
  try {
    const result = await waitForHealth();
    await verifyFreshDemoLogin();
    console.log(`Online API smoke test passed: ok=${result.health.ok}, ready=${result.readiness.ready}, store=${result.health.store || 'json'}, demoLogin=true.`);
  } catch (error) {
    console.error(stderr || error.message);
    process.exitCode = 1;
  } finally {
    server.kill();
    if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  }
})();
