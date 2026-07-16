const assert=require('assert');const fs=require('fs');
const runner=fs.readFileSync('scripts/smoke-deployed-app.js','utf8');const workflow=fs.readFileSync('.github/workflows/online-smoke.yml','utf8');const notes=fs.readFileSync('PHASE47_RELEASE_NOTES.md','utf8');
assert.match(runner,/SMOKE_TIMEOUT_MS/);assert.match(runner,/SMOKE_EXPECTED_VERSION/);assert.match(runner,/readiness contract is stale/);assert.match(workflow,/SMOKE_TIMEOUT_MS:\s*90000/);assert.match(workflow,/SMOKE_EXPECTED_VERSION:\s*8\.0\.0-alpha\.1/);assert.match(notes,/Sprint 735/);
console.log('Sprint 735 Render cold-start test passed.');
