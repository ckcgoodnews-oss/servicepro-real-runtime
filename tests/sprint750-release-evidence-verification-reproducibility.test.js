'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'verify-release-evidence.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'release-evidence-verification.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Release evidence verification script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Release evidence verification workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'production-certification.sha256',
  'release-evidence-manifest.json',
  'release-evidence-verification.json',
  'release-reproducibility-report.md',
  'Checksum mismatch',
  'Production certification commit does not match current HEAD',
  'Release build manifest commit does not match current HEAD',
  'Artifact reproducibility mismatch',
  'Certification summary is not portable ASCII',
  'Release evidence verification requires a clean working tree',
]) {
  assert.ok(
    source.includes(requiredText),
    `Verification script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:evidence:verify'],
  'node scripts/verify-release-evidence.js',
  'release:evidence:verify command is incorrect.',
);

assert.strictEqual(
  packageJson.scripts['release:reproduce'],
  'npm run release:certify && npm run release:evidence:harden && npm run release:evidence:verify',
  'release:reproduce command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'npm run release:reproduce',
  'reports/release/',
  'reports/build/release-manifest.json',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Verification workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 750 release evidence verification and reproducibility test passed.',
);
