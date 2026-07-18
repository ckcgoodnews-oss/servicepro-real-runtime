'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const registryRoot = path.join(
  releaseRoot,
  'trusted-release-registry',
);

const entryPath = path.join(
  registryRoot,
  'trusted-release-entry.json',
);
const indexPath = path.join(
  registryRoot,
  'index.json',
);
const decisionPath = path.join(
  releaseRoot,
  'deployment-admission-decision.json',
);
const decisionSummaryPath = path.join(
  releaseRoot,
  'deployment-admission-decision.md',
);

function fail(message, error) {
  console.error(`DEPLOYMENT ADMISSION DENIED: ${message}`);

  if (error?.stack) {
    console.error(error.stack);
  }

  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required registry evidence missing: ${filePath}`);
  }

  return JSON.parse(
    fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''),
  );
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed`);
  }

  return String(result.stdout || '').trim();
}

function main() {
  console.log('ServicePro deployment admission control');

  const entry = readJson(entryPath);
  const index = readJson(indexPath);

  const commit = runGit(['rev-parse', 'HEAD']);
  const requestedEnvironment =
    process.env.RELEASE_TARGET_ENVIRONMENT ||
    entry.deployment?.targetEnvironment;
  const allowedEnvironments = String(
    process.env.RELEASE_ADMISSION_ENVIRONMENTS ||
      'staging,production',
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const indexedRelease = index.releases?.find(
    (release) =>
      release.releaseId === entry.releaseId,
  );

  const checks = {
    registryEntryValid:
      entry.result === 'registered',
    releaseIndexed:
      Boolean(indexedRelease),
    registryEntryDigestMatched:
      indexedRelease?.entrySha256 === sha256(entryPath),
    sourceCommitMatched:
      entry.source?.commit === commit,
    targetEnvironmentMatched:
      entry.deployment?.targetEnvironment ===
      requestedEnvironment,
    targetEnvironmentAllowed:
      allowedEnvironments.includes(requestedEnvironment),
    signerIdentityPresent:
      Boolean(entry.signer?.identity),
    signingFingerprintPresent:
      Boolean(entry.signer?.keyFingerprintSha256),
    allRegistryChecksPassed:
      Object.values(entry.checks || {}).every(
        (value) => value === true,
      ),
  };

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  const admitted = failed.length === 0;

  const decision = {
    schemaVersion: 1,
    result: admitted ? 'admitted' : 'denied',
    decidedAt: new Date().toISOString(),
    releaseId: entry.releaseId,
    targetEnvironment: requestedEnvironment,
    sourceCommit: commit,
    registryEntry: {
      path:
        'reports/release/trusted-release-registry/trusted-release-entry.json',
      sha256: sha256(entryPath),
    },
    checks,
    denialReasons: failed,
  };

  fs.writeFileSync(
    decisionPath,
    `${JSON.stringify(decision, null, 2)}\n`,
    'utf8',
  );

  const markdown = [
    '# ServicePro Deployment Admission Decision',
    '',
    `- Result: **${decision.result.toUpperCase()}**`,
    `- Decided: ${decision.decidedAt}`,
    `- Release ID: ${decision.releaseId}`,
    `- Environment: ${decision.targetEnvironment}`,
    `- Commit: ${decision.sourceCommit}`,
    '',
    '## Admission checks',
    '',
    ...Object.entries(checks).map(
      ([name, passed]) =>
        `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
  ];

  if (!admitted) {
    markdown.push(
      '## Denial reasons',
      '',
      ...failed.map((name) => `- ${name}`),
      '',
    );
  }

  fs.writeFileSync(
    decisionSummaryPath,
    markdown.join('\n'),
    'utf8',
  );

  if (!admitted) {
    throw new Error(
      `Admission checks failed: ${failed.join(', ')}`,
    );
  }

  console.log('');
  console.log('DEPLOYMENT ADMISSION PASSED');
  console.log(`Release ID: ${decision.releaseId}`);
  console.log(`Decision: ${decisionPath}`);
  console.log(`Summary: ${decisionSummaryPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
