'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const registryRoot = path.join(releaseRoot, 'trusted-release-registry');

const signingRecordPath = path.join(
  releaseRoot,
  'release-signing-record.json',
);
const verificationPath = path.join(
  releaseRoot,
  'release-signature-verification.json',
);
const authorizationPath = path.join(
  releaseRoot,
  'deployment-authorization.json',
);
const bundleManifestPath = path.join(
  releaseRoot,
  'immutable-release-bundle-manifest.json',
);

const registryIndexPath = path.join(
  registryRoot,
  'index.json',
);
const registryEntryPath = path.join(
  registryRoot,
  'trusted-release-entry.json',
);
const registrySummaryPath = path.join(
  registryRoot,
  'trusted-release-entry.md',
);

function fail(message, error) {
  console.error(`TRUSTED RELEASE REGISTRATION FAILED: ${message}`);

  if (error?.stack) {
    console.error(error.stack);
  }

  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required release evidence missing: ${filePath}`);
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

function assertCleanWorkingTree() {
  const status = runGit([
    'status',
    '--porcelain',
    '--untracked-files=all',
  ]);

  if (status) {
    throw new Error(
      `Trusted release registration requires a clean working tree.\n${status}`,
    );
  }
}

function main() {
  console.log('ServicePro trusted release registry');

  assertCleanWorkingTree();

  const signing = readJson(signingRecordPath);
  const verification = readJson(verificationPath);
  const authorization = readJson(authorizationPath);
  const bundle = readJson(bundleManifestPath);

  const commit = runGit(['rev-parse', 'HEAD']);
  const branch =
    process.env.GITHUB_REF_NAME ||
    runGit(['branch', '--show-current']) ||
    'detached';
  const repository =
    runGit(['config', '--get', 'remote.origin.url']) ||
    'unknown';

  const checks = {
    signingResultValid: signing.result === 'signed',
    verificationResultValid: verification.result === 'verified',
    authorizationResultValid:
      authorization.result === 'authorized',
    bundleResultValid: bundle.result === 'sealed',
    sourceCommitMatched:
      signing.source?.commit === commit &&
      verification.sourceCommit === commit &&
      authorization.source?.commit === commit &&
      bundle.source?.commit === commit,
    signatureVerified:
      verification.checks?.signatureVerified === true,
    subjectDigestMatched:
      verification.checks?.subjectDigestMatched === true,
    sourceCommitVerified:
      verification.checks?.sourceCommitMatched === true,
  };

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(
      `Trusted release registration checks failed: ${failed.join(', ')}`,
    );
  }

  fs.mkdirSync(registryRoot, { recursive: true });

  const releaseId =
    process.env.RELEASE_REGISTRY_ID ||
    `${authorization.application.name}-${authorization.application.version}-${commit.slice(0, 12)}`;

  const entry = {
    schemaVersion: 1,
    result: 'registered',
    registeredAt: new Date().toISOString(),
    releaseId,
    application: authorization.application,
    deployment: authorization.authorization,
    source: {
      repository,
      branch,
      commit,
      shortCommit: commit.slice(0, 7),
    },
    signer: signing.signer,
    evidence: {
      immutableBundleManifest: {
        path: 'reports/release/immutable-release-bundle-manifest.json',
        sha256: sha256(bundleManifestPath),
      },
      signingRecord: {
        path: 'reports/release/release-signing-record.json',
        sha256: sha256(signingRecordPath),
      },
      signatureVerification: {
        path: 'reports/release/release-signature-verification.json',
        sha256: sha256(verificationPath),
      },
      deploymentAuthorization: {
        path: 'reports/release/deployment-authorization.json',
        sha256: sha256(authorizationPath),
      },
    },
    checks,
  };

  fs.writeFileSync(
    registryEntryPath,
    `${JSON.stringify(entry, null, 2)}\n`,
    'utf8',
  );

  let index = {
    schemaVersion: 1,
    updatedAt: null,
    releases: [],
  };

  if (fs.existsSync(registryIndexPath)) {
    index = readJson(registryIndexPath);
  }

  index.releases = Array.isArray(index.releases)
    ? index.releases
    : [];

  index.releases = index.releases.filter(
    (item) => item.releaseId !== releaseId,
  );

  index.releases.push({
    releaseId,
    registeredAt: entry.registeredAt,
    application: entry.application,
    targetEnvironment:
      entry.deployment.targetEnvironment,
    commit,
    signer: entry.signer,
    entryPath:
      'reports/release/trusted-release-registry/trusted-release-entry.json',
    entrySha256: sha256(registryEntryPath),
  });

  index.updatedAt = new Date().toISOString();

  fs.writeFileSync(
    registryIndexPath,
    `${JSON.stringify(index, null, 2)}\n`,
    'utf8',
  );

  const markdown = [
    '# ServicePro Trusted Release Registry Entry',
    '',
    '- Result: **REGISTERED**',
    `- Release ID: ${releaseId}`,
    `- Registered: ${entry.registeredAt}`,
    `- Application: ${entry.application.name}`,
    `- Version: ${entry.application.version}`,
    `- Environment: ${entry.deployment.targetEnvironment}`,
    `- Commit: ${commit}`,
    `- Signer: ${entry.signer.identity}`,
    '',
    '## Registry checks',
    '',
    ...Object.entries(checks).map(
      ([name, passed]) =>
        `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
  ].join('\n');

  fs.writeFileSync(
    registrySummaryPath,
    markdown,
    'utf8',
  );

  assertCleanWorkingTree();

  console.log('');
  console.log('TRUSTED RELEASE REGISTRATION PASSED');
  console.log(`Release ID: ${releaseId}`);
  console.log(`Registry entry: ${registryEntryPath}`);
  console.log(`Registry index: ${registryIndexPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
