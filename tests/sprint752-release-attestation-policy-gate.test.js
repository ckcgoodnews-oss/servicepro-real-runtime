'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'evaluate-release-policy.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'release-policy-gate.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Release policy gate script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Release policy gate workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'release-policy-gate.json',
  'release-policy-gate.md',
  'Release policy evaluation requires a clean working tree',
  'RELEASE_ALLOWED_BRANCHES',
  'RELEASE_REQUIRE_CI',
  'provenanceDigestMatched',
  'materialsPresent',
  'promotion',
  'eligible: true',
  'Release policy checks failed',
]) {
  assert.ok(
    source.includes(requiredText),
    `Policy gate script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:policy'],
  'node scripts/evaluate-release-policy.js',
  'release:policy command is incorrect.',
);

assert.strictEqual(
  packageJson.scripts['release:gate'],
  'npm run release:prove && npm run release:policy',
  'release:gate command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'npm run release:gate',
  'RELEASE_REQUIRE_CI',
  'reports/release/',
  'retention-days: 365',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Policy workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 752 release attestation verification and policy gate test passed.',
);
