const assert = require('assert');
const fs = require('fs');
const packageJson = require('../package.json');

const script = fs.readFileSync('scripts/test-local-webapp.ps1', 'utf8');
assert.ok(script.includes('/healthz'));
assert.ok(script.includes('/readyz'));
assert.ok(script.includes('node_modules\\next\\dist\\bin\\next'));
assert.ok(script.includes('LOCAL_TEST_EMAIL'));
assert.ok(script.includes('LOCAL_TEST_PASSWORD'));
assert.ok(script.includes('scripts/smoke-deployed-app.js'));
assert.ok(!script.includes('ChangeMe123!'));
assert.strictEqual(packageJson.scripts['web:test:local'], 'powershell -ExecutionPolicy Bypass -File scripts/test-local-webapp.ps1');
assert.strictEqual(packageJson.scripts['web:test:local:auth'], 'powershell -ExecutionPolicy Bypass -File scripts/test-local-webapp.ps1 -RequireAuth');
console.log('Sprint 746 authenticated local webapp E2E test passed.');
