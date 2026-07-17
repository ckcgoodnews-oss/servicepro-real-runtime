'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'authorize-release-promotion.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'release-deployment-authorization.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Release promotion authorization script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Deployment authorization workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'release-promotion-manifest.json',
  'deployment-authorization.json',
  'deployment-authorization.md',
  'RELEASE_TARGET_ENVIRONMENT',
  'RELEASE_AUTH_REQUIRE_CI',
  'RELEASE_AUTHORIZATION_ACTOR',
  'RELEASE_AUTHORIZATION_REASON',
  'promotionEligible',
  'attestationIntegrityVerified',
  "result: 'authorized'",
  'Deployment authorization requires a clean working tree',
]) {
  assert.ok(
    source.includes(requiredText),
    `Authorization script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:authorize'],
  'node scripts/authorize-release-promotion.js',
  'release:authorize command is incorrect.',
);

assert.strictEqual(
  packageJson.scripts['release:promote'],
  'npm run release:gate && npm run release:authorize',
  'release:promote command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'environment:',
  'npm run release:promote',
  'RELEASE_AUTH_REQUIRE_CI',
  'RELEASE_AUTHORIZATION_ACTOR',
  'reports/release/',
  'retention-days: 365',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Authorization workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 753 release promotion manifest and deployment authorization test passed.',
);
