'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(root, 'scripts', 'certify-production-release.js');
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'production-release-certification.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(fs.existsSync(scriptPath), 'Certification script is missing.');
assert.ok(fs.existsSync(workflowPath), 'Certification workflow is missing.');

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  "status', '--porcelain', '--untracked-files=all'",
  'The working tree is not clean',
  'production-certification.json',
  'production-certification.md',
  'sprint744-company-provisioning-automation.test.js',
  'sprint745-local-webapp-test-harness.test.js',
  'sprint746-authenticated-local-webapp-e2e.test.js',
  'sprint747-root-build-orchestration.test.js',
  'sprint748-production-release-certification.test.js',
  'build:render:verify',
  "runNpm(['run', 'build']",
  'validateNextArtifacts',
  'validateReleaseManifest',
  'manifest.source?.workingTreeClean !== true',
  "manifest.build?.nodeEnvironment !== 'production'",
]) {
  assert.ok(
    source.includes(requiredText),
    `Certification script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:certify'],
  'node scripts/certify-production-release.js',
  'release:certify package command is incorrect.',
);

for (const requiredWorkflowText of [
  'workflow_dispatch:',
  'npm ci',
  'npm run release:certify',
  'reports/release/',
  'reports/build/release-manifest.json',
]) {
  assert.ok(
    workflow.includes(requiredWorkflowText),
    `Workflow is missing: ${requiredWorkflowText}`,
  );
}

console.log('Sprint 748 production release certification test passed.');
