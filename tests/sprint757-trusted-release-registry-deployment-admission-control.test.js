'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'scripts/register-trusted-release.js',
  'scripts/evaluate-deployment-admission.js',
  '.github/workflows/trusted-release-admission.yml',
];

for (const file of requiredFiles) {
  assert.ok(
    fs.existsSync(path.join(root, file)),
    `Missing Sprint 757 file: ${file}`,
  );
}

const packageJson = JSON.parse(
  fs.readFileSync(
    path.join(root, 'package.json'),
    'utf8',
  ).replace(/^\uFEFF/, ''),
);

assert.strictEqual(
  packageJson.scripts['release:register'],
  'node scripts/register-trusted-release.js',
);

assert.strictEqual(
  packageJson.scripts['release:admit'],
  'node scripts/evaluate-deployment-admission.js',
);

assert.strictEqual(
  packageJson.scripts['release:deployable'],
  'npm run release:trusted && npm run release:register && npm run release:admit',
);

const registerSource = fs.readFileSync(
  path.join(root, 'scripts/register-trusted-release.js'),
  'utf8',
);

const admitSource = fs.readFileSync(
  path.join(root, 'scripts/evaluate-deployment-admission.js'),
  'utf8',
);

for (const requiredText of [
  'trusted-release-registry',
  'trusted-release-entry.json',
  'TRUSTED RELEASE REGISTRATION PASSED',
  'sourceCommitMatched',
]) {
  assert.ok(
    registerSource.includes(requiredText),
    `Registration script missing: ${requiredText}`,
  );
}

for (const requiredText of [
  'deployment-admission-decision.json',
  'DEPLOYMENT ADMISSION PASSED',
  'targetEnvironmentAllowed',
  'registryEntryDigestMatched',
]) {
  assert.ok(
    admitSource.includes(requiredText),
    `Admission script missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 757 trusted release registry and deployment admission control test passed.',
);
