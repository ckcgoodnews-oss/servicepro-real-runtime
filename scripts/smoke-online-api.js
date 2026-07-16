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
      const response = await fetch(`http://127.0.0.1:${port}/healthz`);
      const body = await response.json();
      if (response.ok && body.ok === true) return body;
      lastError = new Error(`Health check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw lastError || new Error('API health check timed out');
}

(async () => {
  try {
    const health = await waitForHealth();
    console.log(`Online API smoke test passed: ok=${health.ok}, store=${health.store || 'json'}.`);
  } catch (error) {
    console.error(stderr || error.message);
    process.exitCode = 1;
  } finally {
    server.kill();
    if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
  }
})();
