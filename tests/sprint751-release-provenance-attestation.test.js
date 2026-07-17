'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'attest-release-provenance.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'release-provenance-attestation.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Release provenance attestation script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Release provenance workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'release-provenance.json',
  'release-attestation.json',
  'release-attestation.md',
  'https://in-toto.io/Statement/v1',
  'release-provenance/v1',
  'Release attestation requires a clean working tree',
  'Release evidence source commit does not match current HEAD',
  'githubRunId',
  'materials',
  'provenanceSha256',
]) {
  assert.ok(
    source.includes(requiredText),
    `Attestation script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:attest'],
  'node scripts/attest-release-provenance.js',
  'release:attest command is incorrect.',
);

assert.strictEqual(
  packageJson.scripts['release:prove'],
  'npm run release:reproduce && npm run release:attest',
  'release:prove command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'npm run release:prove',
  'reports/release/',
  'retention-days: 365',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Attestation workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 751 release provenance and attestation test passed.',
);
