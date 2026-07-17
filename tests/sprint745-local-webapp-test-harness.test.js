const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'test-local-webapp.ps1');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const script = fs.readFileSync(scriptPath, 'utf8');

assert.equal(pkg.scripts['web:dev'], 'npm --prefix apps/web run dev -- -p 3001');
assert.equal(pkg.scripts['web:build'], 'npm --prefix apps/web run build');
assert.equal(pkg.scripts['web:typecheck'], 'npm --prefix apps/web run typecheck');
assert.ok(pkg.scripts['web:test:local'].includes('test-local-webapp.ps1'));
assert.ok(script.includes('[int]$ApiPort = 3000'));
assert.ok(script.includes('[int]$WebPort = 3001'));
assert.ok(script.includes('/health'));
assert.ok(script.includes('/login'));
assert.ok(script.includes('LOCAL WEB APP TEST PASSED'));
assert.ok(script.includes('Start-Process'));
console.log('Sprint 745 local webapp test harness test passed.');
