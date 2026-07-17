'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');

const policyGatePath = path.join(
  releaseRoot,
  'release-policy-gate.json',
);
const attestationPath = path.join(
  releaseRoot,
  'release-attestation.json',
);
const provenancePath = path.join(
  releaseRoot,
  'release-provenance.json',
);
const promotionManifestPath = path.join(
  releaseRoot,
  'release-promotion-manifest.json',
);
const authorizationPath = path.join(
  releaseRoot,
  'deployment-authorization.json',
);
const authorizationSummaryPath = path.join(
  releaseRoot,
  'deployment-authorization.md',
);

function fail(message, error) {
  console.error(`DEPLOYMENT AUTHORIZATION FAILED: ${message}`);

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
      'Deployment authorization requires a clean working tree.\n' +
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

  if (!/^[0-9a-f]{40}$/i.test(commit)) {
    throw new Error(`Invalid current commit SHA: ${commit}`);
  }

  return {
    repository,
    branch,
    commit,
    shortCommit: commit.slice(0, 7),
  };
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value).trim().toLowerCase() === 'true';
}

function normalizeEnvironment(value) {
  const environment = String(value || 'production')
    .trim()
    .toLowerCase();

  if (!/^[a-z0-9][a-z0-9-]{1,31}$/.test(environment)) {
    throw new Error(
      `Invalid deployment environment: ${environment}`,
    );
  }

  return environment;
}

function loadAuthorizationPolicy() {
  return {
    environment: normalizeEnvironment(
      process.env.RELEASE_TARGET_ENVIRONMENT,
    ),
    requireCi:
      parseBoolean(process.env.RELEASE_AUTH_REQUIRE_CI, false),
    requirePolicyGate: true,
    requirePromotionEligibility: true,
    requireExactCommitMatch: true,
    requireAttestationIntegrity: true,
    requireProvenanceIntegrity: true,
    requireAuthorizationActor:
      parseBoolean(
        process.env.RELEASE_REQUIRE_AUTHORIZATION_ACTOR,
        false,
      ),
    authorizationActor:
      process.env.RELEASE_AUTHORIZATION_ACTOR ||
      process.env.GITHUB_ACTOR ||
      'local-operator',
    authorizationReason:
      process.env.RELEASE_AUTHORIZATION_REASON ||
      'Release policy gate passed and promotion criteria were satisfied.',
  };
}

function validateInputs(source, policy) {
  requireFile(policyGatePath, 'Release policy gate');
  requireFile(attestationPath, 'Release attestation');
  requireFile(provenancePath, 'Release provenance');

  const policyGate = readJson(policyGatePath);
  const attestation = readJson(attestationPath);
  const provenance = readJson(provenancePath);

  const checks = {
    policyGatePassed:
      policyGate.result === 'passed',
    promotionEligible:
      policyGate.promotion?.eligible === true,
    sourceCommitMatched:
      policyGate.source?.commit === source.commit &&
      attestation.predicate?.source?.commit === source.commit &&
      provenance.source?.commit === source.commit,
    attestationIntegrityVerified:
      attestation.predicate?.provenanceSha256 ===
        sha256(provenancePath) &&
      attestation.subject?.[0]?.digest?.sha256 ===
        sha256(provenancePath),
    provenancePresent:
      Boolean(provenance.subject?.application?.name) &&
      Boolean(provenance.subject?.application?.version),
    ciRequirementSatisfied:
      !policy.requireCi ||
      provenance.invocation?.ci === true,
    authorizationActorPresent:
      !policy.requireAuthorizationActor ||
      Boolean(policy.authorizationActor),
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failedChecks.length > 0) {
    throw new Error(
      `Deployment authorization checks failed: ${failedChecks.join(', ')}`,
    );
  }

  return {
    policyGate,
    attestation,
    provenance,
    checks,
  };
}

function createPromotionManifest({
  source,
  policy,
  inputs,
}) {
  const application = inputs.provenance.subject.application;

  const manifest = {
    schemaVersion: 1,
    result: 'approved',
    createdAt: new Date().toISOString(),
    promotion: {
      eligible: true,
      targetEnvironment: policy.environment,
      sourceEnvironment: 'certified-build',
      application,
      nextBuildId:
        inputs.provenance.subject.nextBuildId,
    },
    source,
    evidence: [
      {
        path: path
          .relative(root, policyGatePath)
          .replaceAll('\\', '/'),
        sha256: sha256(policyGatePath),
      },
      {
        path: path
          .relative(root, attestationPath)
          .replaceAll('\\', '/'),
        sha256: sha256(attestationPath),
      },
      {
        path: path
          .relative(root, provenancePath)
          .replaceAll('\\', '/'),
        sha256: sha256(provenancePath),
      },
    ],
    policyDecision: {
      result: inputs.policyGate.result,
      promotionEligible:
        inputs.policyGate.promotion.eligible,
      evaluatedAt:
        inputs.policyGate.evaluatedAt,
    },
  };

  fs.writeFileSync(
    promotionManifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  return manifest;
}

function createAuthorization({
  source,
  policy,
  inputs,
  promotionManifest,
}) {
  const promotionManifestSha256 = sha256(
    promotionManifestPath,
  );

  const authorization = {
    schemaVersion: 1,
    result: 'authorized',
    authorizedAt: new Date().toISOString(),
    authorization: {
      authorized: true,
      targetEnvironment: policy.environment,
      actor: policy.authorizationActor,
      reason: policy.authorizationReason,
      expiresAt: null,
    },
    source,
    application:
      promotionManifest.promotion.application,
    promotionManifest: {
      path: path
        .relative(root, promotionManifestPath)
        .replaceAll('\\', '/'),
      sha256: promotionManifestSha256,
    },
    releaseEvidence: {
      policyGateSha256: sha256(policyGatePath),
      attestationSha256: sha256(attestationPath),
      provenanceSha256: sha256(provenancePath),
    },
    checks: inputs.checks,
  };

  fs.writeFileSync(
    authorizationPath,
    `${JSON.stringify(authorization, null, 2)}\n`,
    'utf8',
  );

  const markdown = [
    '# ServicePro Deployment Authorization',
    '',
    '- Result: **AUTHORIZED**',
    `- Authorized: ${authorization.authorizedAt}`,
    `- Environment: ${authorization.authorization.targetEnvironment}`,
    `- Actor: ${authorization.authorization.actor}`,
    `- Application: ${authorization.application.name}`,
    `- Version: ${authorization.application.version}`,
    `- Branch: ${authorization.source.branch}`,
    `- Commit: ${authorization.source.commit}`,
    `- Promotion manifest SHA-256: ${promotionManifestSha256}`,
    '',
    '## Authorization checks',
    '',
    ...Object.entries(authorization.checks).map(
      ([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
    '## Authorization reason',
    '',
    authorization.authorization.reason,
    '',
  ].join('\n');

  if (/[^\x00-\x7F]/.test(markdown)) {
    throw new Error(
      'Deployment authorization summary contains non-ASCII characters.',
    );
  }

  fs.writeFileSync(
    authorizationSummaryPath,
    markdown,
    'utf8',
  );
}

function main() {
  console.log('ServicePro release promotion and deployment authorization');

  assertCleanWorkingTree();

  const source = resolveSource();
  const policy = loadAuthorizationPolicy();
  const inputs = validateInputs(source, policy);
  const promotionManifest = createPromotionManifest({
    source,
    policy,
    inputs,
  });

  createAuthorization({
    source,
    policy,
    inputs,
    promotionManifest,
  });

  assertCleanWorkingTree();

  console.log('');
  console.log('DEPLOYMENT AUTHORIZATION PASSED');
  console.log(`Promotion manifest: ${promotionManifestPath}`);
  console.log(`Authorization:       ${authorizationPath}`);
  console.log(`Summary:             ${authorizationSummaryPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
