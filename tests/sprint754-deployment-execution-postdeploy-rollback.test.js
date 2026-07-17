'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const scriptPath = path.join(
  root,
  'scripts',
  'verify-deployment-execution.js',
);
const workflowPath = path.join(
  root,
  '.github',
  'workflows',
  'post-deployment-verification.yml',
);
const packagePath = path.join(root, 'package.json');

assert.ok(
  fs.existsSync(scriptPath),
  'Deployment execution verification script is missing.',
);

assert.ok(
  fs.existsSync(workflowPath),
  'Post-deployment verification workflow is missing.',
);

const source = fs.readFileSync(scriptPath, 'utf8');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const packageJson = JSON.parse(
  fs.readFileSync(packagePath, 'utf8').replace(/^\uFEFF/, ''),
);

for (const requiredText of [
  'deployment-execution-receipt.json',
  'post-deployment-verification.json',
  'rollback-readiness.json',
  'deployment-execution-summary.md',
  'DEPLOYMENT_URL',
  'DEPLOYMENT_HEALTH_PATH',
  'DEPLOYMENT_EXPECTED_STATUS',
  'ROLLBACK_REFERENCE',
  'ROLLBACK_COMMAND',
  'AUTOMATIC_ROLLBACK_ENABLED',
  'Deployment authorization validation failed',
  'DEPLOYMENT EXECUTION VERIFICATION PASSED',
]) {
  assert.ok(
    source.includes(requiredText),
    `Deployment verification script is missing: ${requiredText}`,
  );
}

assert.strictEqual(
  packageJson.scripts['release:verify-deployment'],
  'node scripts/verify-deployment-execution.js',
  'release:verify-deployment command is incorrect.',
);

assert.strictEqual(
  packageJson.scripts['release:deploy-verify'],
  'npm run release:promote && npm run release:verify-deployment',
  'release:deploy-verify command is incorrect.',
);

for (const requiredText of [
  'workflow_dispatch:',
  'deployment_url:',
  'npm run release:deploy-verify',
  'DEPLOYMENT_URL',
  'ROLLBACK_REFERENCE',
  'reports/release/',
  'retention-days: 365',
]) {
  assert.ok(
    workflow.includes(requiredText),
    `Post-deployment workflow is missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 754 deployment execution, post-deployment verification, and rollback readiness test passed.',
);
