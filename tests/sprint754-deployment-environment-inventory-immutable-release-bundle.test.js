'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'build-immutable-release-bundle.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'immutable-release-bundle.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Immutable release bundle script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Immutable release bundle workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'deployment-environment-inventory.json',
  'immutable-release-bundle-manifest.json',
  'immutable-release-bundle.md',
  'DATABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  '[REDACTED]',
  'fingerprint',
  "result: 'sealed'",
  'Deployment authorization commit does not match HEAD',
  'Immutable release bundling requires a clean working tree',
]) {
  assert.ok(
    source.includes(requiredText),
    `Bundle script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:bundle'],
  'node scripts/build-immutable-release-bundle.js',
  'release:bundle command is incorrect.',
);

assert.strictEqual(
  packageJson.scripts['release:seal'],
  'npm run release:promote && npm run release:bundle',
  'release:seal command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'npm run release:seal',
  'RELEASE_TARGET_ENVIRONMENT',
  'deployment-environment-inventory.json',
  'retention-days: 365',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Bundle workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 754 deployment environment inventory and immutable release bundle test passed.',
);
