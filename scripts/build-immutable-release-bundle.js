'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const bundleRoot = path.join(releaseRoot, 'immutable-bundle');

const authorizationPath = path.join(
  releaseRoot,
  'deployment-authorization.json',
);
const promotionManifestPath = path.join(
  releaseRoot,
  'release-promotion-manifest.json',
);
const policyGatePath = path.join(
  releaseRoot,
  'release-policy-gate.json',
);
const provenancePath = path.join(
  releaseRoot,
  'release-provenance.json',
);
const attestationPath = path.join(
  releaseRoot,
  'release-attestation.json',
);

const environmentInventoryPath = path.join(
  releaseRoot,
  'deployment-environment-inventory.json',
);
const bundleManifestPath = path.join(
  releaseRoot,
  'immutable-release-bundle-manifest.json',
);
const bundleSummaryPath = path.join(
  releaseRoot,
  'immutable-release-bundle.md',
);

function fail(message, error) {
  console.error(`IMMUTABLE RELEASE BUNDLE FAILED: ${message}`);

  if (error?.stack) {
    console.error(error.stack);
  }

  process.exit(1);
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON file ${filePath}: ${error.message}`);
  }
}

function requireFile(filePath, description) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new Error(
      `${description} was not found: ${path.relative(root, filePath)}`,
    );
  }

  const stats = fs.statSync(filePath);

  if (stats.size <= 0) {
    throw new Error(
      `${description} is empty: ${path.relative(root, filePath)}`,
    );
  }

  return stats;
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

  if (result.error) {
    throw new Error(`git could not be started: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(' ')} failed with exit code ${result.status}`,
    );
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
      'Immutable release bundling requires a clean working tree.\n' +
        status,
    );
  }
}

function resolveSource() {
  const commit = runGit(['rev-parse', 'HEAD']);
  const branch =
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    runGit(['branch', '--show-current']) ||
    'detached';
  const repository = runGit([
    'config',
    '--get',
    'remote.origin.url',
  ]) || 'unknown';

  return {
    repository,
    branch,
    commit,
    shortCommit: commit.slice(0, 7),
  };
}

function redactValue(name, value) {
  if (value === undefined || value === null || value === '') {
    return {
      present: false,
      value: null,
      redacted: false,
    };
  }

  const secretPattern =
    /(SECRET|PASSWORD|TOKEN|KEY|PRIVATE|CREDENTIAL|DATABASE_URL)/i;

  if (secretPattern.test(name)) {
    return {
      present: true,
      value: '[REDACTED]',
      redacted: true,
      fingerprint: crypto
        .createHash('sha256')
        .update(String(value))
        .digest('hex')
        .slice(0, 16),
    };
  }

  return {
    present: true,
    value: String(value),
    redacted: false,
  };
}

function collectEnvironmentInventory(authorization) {
  const requestedNames = [
    'NODE_ENV',
    'ALLOW_LOCAL_PRODUCTION_BUILD',
    'NEXT_PUBLIC_API_BASE_URL',
    'RELEASE_REQUIRE_CI',
    'RELEASE_AUTH_REQUIRE_CI',
    'RELEASE_REQUIRE_AUTHORIZATION_ACTOR',
    'RELEASE_ALLOWED_BRANCHES',
    'RELEASE_TARGET_ENVIRONMENT',
    'RELEASE_AUTHORIZATION_ACTOR',
    'RELEASE_AUTHORIZATION_REASON',
    'DATA_STORE',
    'DATABASE_URL',
    'DATABASE_SSL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
  ];

  const variables = {};

  for (const name of requestedNames) {
    variables[name] = redactValue(name, process.env[name]);
  }

  return {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    targetEnvironment:
      authorization.authorization.targetEnvironment,
    authorizationActor:
      authorization.authorization.actor,
    authorizationReason:
      authorization.authorization.reason,
    process: {
      platform: process.platform,
      architecture: process.arch,
      nodeVersion: process.version,
      workingDirectory: root,
    },
    variables,
    sourceGuidance: {
      local:
        '.env, .env.local, the current PowerShell session, and Windows user or system environment variables',
      github:
        'Repository Settings > Secrets and variables > Actions, plus GitHub Environment secrets and variables',
      deployment:
        'The environment-variable settings of the production hosting provider',
      database:
        'Supabase project connection settings or the managed PostgreSQL provider',
    },
  };
}

function copyEvidence(sourcePath) {
  const destination = path.join(
    bundleRoot,
    path.basename(sourcePath),
  );

  fs.copyFileSync(sourcePath, destination);

  return {
    path: path
      .relative(root, destination)
      .replaceAll('\\', '/'),
    sizeBytes: fs.statSync(destination).size,
    sha256: sha256(destination),
  };
}

function main() {
  console.log('ServicePro deployment environment inventory and immutable bundle');

  assertCleanWorkingTree();

  for (const [filePath, description] of [
    [authorizationPath, 'Deployment authorization'],
    [promotionManifestPath, 'Release promotion manifest'],
    [policyGatePath, 'Release policy gate'],
    [provenancePath, 'Release provenance'],
    [attestationPath, 'Release attestation'],
  ]) {
    requireFile(filePath, description);
  }

  const source = resolveSource();
  const authorization = readJson(authorizationPath);

  if (authorization.result !== 'authorized') {
    throw new Error(
      'Deployment authorization result is not authorized.',
    );
  }

  if (authorization.source?.commit !== source.commit) {
    throw new Error(
      'Deployment authorization commit does not match HEAD.',
    );
  }

  fs.mkdirSync(bundleRoot, { recursive: true });

  const inventory = collectEnvironmentInventory(authorization);

  fs.writeFileSync(
    environmentInventoryPath,
    `${JSON.stringify(inventory, null, 2)}\n`,
    'utf8',
  );

  const bundledFiles = [
    authorizationPath,
    promotionManifestPath,
    policyGatePath,
    provenancePath,
    attestationPath,
    environmentInventoryPath,
  ].map(copyEvidence);

  const manifest = {
    schemaVersion: 1,
    result: 'sealed',
    createdAt: new Date().toISOString(),
    source,
    application: authorization.application,
    deployment: authorization.authorization,
    immutableBundle: {
      directory: path
        .relative(root, bundleRoot)
        .replaceAll('\\', '/'),
      fileCount: bundledFiles.length,
      files: bundledFiles,
    },
  };

  fs.writeFileSync(
    bundleManifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  const manifestDigest = sha256(bundleManifestPath);

  const markdown = [
    '# ServicePro Immutable Release Bundle',
    '',
    '- Result: **SEALED**',
    `- Created: ${manifest.createdAt}`,
    `- Application: ${manifest.application.name}`,
    `- Version: ${manifest.application.version}`,
    `- Environment: ${manifest.deployment.targetEnvironment}`,
    `- Actor: ${manifest.deployment.actor}`,
    `- Branch: ${manifest.source.branch}`,
    `- Commit: ${manifest.source.commit}`,
    `- Manifest SHA-256: ${manifestDigest}`,
    '',
    '## Bundled evidence',
    '',
    ...bundledFiles.map(
      (file) =>
        `- ${file.path} - ${file.sizeBytes} bytes - SHA-256 ${file.sha256}`,
    ),
    '',
    'Sensitive environment values are redacted. Secret fingerprints are',
    'included only to verify that a value was present without disclosing it.',
    '',
  ].join('\n');

  fs.writeFileSync(bundleSummaryPath, markdown, 'utf8');

  assertCleanWorkingTree();

  console.log('');
  console.log('IMMUTABLE RELEASE BUNDLE PASSED');
  console.log(`Environment inventory: ${environmentInventoryPath}`);
  console.log(`Bundle manifest:       ${bundleManifestPath}`);
  console.log(`Bundle directory:      ${bundleRoot}`);
  console.log(`Summary:               ${bundleSummaryPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
