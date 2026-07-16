const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function validateOnlineAlpha() {
  const blueprint = read('render.yaml');
  const guide = read('ONLINE_DEPLOYMENT.md');
  const releaseNotes = read('PHASE47_RELEASE_NOTES.md');
  assert.ok(fs.existsSync(path.join(root, 'scripts/smoke-online-api.js')));

  for (const service of ['servicepro-api-alpha-ckcgoodnews', 'servicepro-web-alpha-ckcgoodnews']) {
    assert.match(blueprint, new RegExp(`name: ${service}`));
  }
  assert.strictEqual((blueprint.match(/branch: codex\/sprint-716-frontend-foundation/g) || []).length, 2);
  assert.strictEqual((blueprint.match(/autoDeployTrigger: off/g) || []).length, 2);
  for (const contract of ['healthCheckPath: /readyz', 'JWT_SECRET', 'PORTAL_TOKEN_SECRET', 'CORS_ALLOWED_ORIGINS', 'NEXT_PUBLIC_API_BASE_URL']) {
    assert.match(blueprint, new RegExp(contract));
  }
  assert.match(guide, /temporary filesystem/);
  assert.match(guide, /Do not enter real customer/);
  assert.match(guide, /PostgreSQL adapter certification/);
  assert.match(releaseNotes, /Sprint 731/);
  assert.match(releaseNotes, /Render online alpha foundation/);

  return { services: 2, branchPinned: true, autoDeploy: false };
}

if (require.main === module) {
  const result = validateOnlineAlpha();
  console.log(`Online alpha validation passed: ${result.services} services, branch pinned, automatic deploys disabled.`);
}

module.exports = { validateOnlineAlpha };
