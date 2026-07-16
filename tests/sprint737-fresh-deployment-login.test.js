const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const serverSource = fs.readFileSync(path.resolve('apps/api/src/server.js'), 'utf8');
assert.ok(!serverSource.includes("require('./store/jsonStore')"), 'API startup must not initialize the legacy partial JSON store');
assert.ok(serverSource.includes('getRepositories()'), 'API startup must initialize the authoritative repository store');

const smoke = spawnSync(process.execPath, ['scripts/smoke-online-api.js'], {
  cwd: path.resolve('.'),
  encoding: 'utf8',
  timeout: 30000
});

assert.strictEqual(smoke.status, 0, smoke.stderr || smoke.stdout || 'Fresh-deployment smoke test failed');
assert.match(smoke.stdout, /demoLogin=true/);
console.log('Sprint 737 fresh-deployment login test passed.');
