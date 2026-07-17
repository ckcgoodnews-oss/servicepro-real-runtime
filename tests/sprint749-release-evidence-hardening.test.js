'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'harden-release-evidence.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'release-evidence-hardening.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Release evidence hardening script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Release evidence hardening workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'production-certification.json',
  'production-certification.md',
  'production-certification.sha256',
  'release-evidence-manifest.json',
  'Certification summary contains non-ASCII characters',
  'source?.workingTreeClean !== true',
  "certification.result !== 'passed'",
  'sha256(filePath)',
]) {
  assert.ok(
    source.includes(requiredText),
    `Hardening script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:evidence:harden'],
  'node scripts/harden-release-evidence.js',
  'release:evidence:harden command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'npm run release:certify',
  'npm run release:evidence:harden',
  'reports/release/',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 749 release evidence hardening test passed.',
);
