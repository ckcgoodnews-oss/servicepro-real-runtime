'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');

const authorizationPath = path.join(
  releaseRoot,
  'deployment-authorization.json',
);
const promotionManifestPath = path.join(
  releaseRoot,
  'release-promotion-manifest.json',
);
const executionReceiptPath = path.join(
  releaseRoot,
  'deployment-execution-receipt.json',
);
const verificationPath = path.join(
  releaseRoot,
  'post-deployment-verification.json',
);
const rollbackPath = path.join(
  releaseRoot,
  'rollback-readiness.json',
);
const summaryPath = path.join(
  releaseRoot,
  'deployment-execution-summary.md',
);

function fail(message, error) {
  console.error(`DEPLOYMENT EXECUTION VERIFICATION FAILED: ${message}`);

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
      'Deployment execution verification requires a clean working tree.\n' +
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

  if (!/^[0-9a-f]{40}$/i.test(commit)) {
    throw new Error(`Invalid current commit SHA: ${commit}`);
  }

  return {
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

function normalizeUrl(value) {
  const url = String(value || '').trim();

  if (!url) {
    throw new Error(
      'DEPLOYMENT_URL is required for post-deployment verification.',
    );
  }

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Unsupported protocol.');
    }

    return parsed.toString().replace(/\/$/, '');
  } catch (error) {
    throw new Error(`Invalid DEPLOYMENT_URL: ${url}`);
  }
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'servicepro-release-verifier/1.0',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyEndpoint(url, expectedStatus, timeoutMs) {
  const startedAt = Date.now();
  const response = await fetchWithTimeout(url, timeoutMs);
  const body = await response.text();
  const durationMs = Date.now() - startedAt;

  if (response.status !== expectedStatus) {
    throw new Error(
      `Unexpected response status for ${url}. ` +
        `Expected ${expectedStatus}, received ${response.status}.`,
    );
  }

  return {
    url,
    status: response.status,
    durationMs,
    bodySha256: crypto
      .createHash('sha256')
      .update(body)
      .digest('hex'),
    contentLength: Buffer.byteLength(body),
    verified: true,
  };
}

function validateAuthorization(source) {
  requireFile(
    authorizationPath,
    'Deployment authorization',
  );
  requireFile(
    promotionManifestPath,
    'Release promotion manifest',
  );

  const authorization = readJson(authorizationPath);
  const promotionManifest = readJson(promotionManifestPath);

  const checks = {
    authorizationPassed:
      authorization.result === 'authorized',
    explicitlyAuthorized:
      authorization.authorization?.authorized === true,
    promotionApproved:
      promotionManifest.result === 'approved',
    promotionEligible:
      promotionManifest.promotion?.eligible === true,
    sourceCommitMatched:
      authorization.source?.commit === source.commit &&
      promotionManifest.source?.commit === source.commit,
    promotionManifestDigestMatched:
      authorization.promotionManifest?.sha256 ===
        sha256(promotionManifestPath),
  };

  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failedChecks.length > 0) {
    throw new Error(
      `Deployment authorization validation failed: ${failedChecks.join(', ')}`,
    );
  }

  return {
    authorization,
    promotionManifest,
    checks,
  };
}

function createExecutionReceipt({
  source,
  deploymentUrl,
  inputs,
}) {
  const receipt = {
    schemaVersion: 1,
    result: 'executed',
    executedAt: new Date().toISOString(),
    deployment: {
      environment:
        inputs.authorization.authorization.targetEnvironment,
      url: deploymentUrl,
      actor:
        process.env.DEPLOYMENT_EXECUTOR ||
        process.env.GITHUB_ACTOR ||
        process.env.USERNAME ||
        'unknown',
      provider:
        process.env.DEPLOYMENT_PROVIDER || 'unspecified',
      deploymentId:
        process.env.DEPLOYMENT_ID ||
        process.env.GITHUB_RUN_ID ||
        `local-${Date.now()}`,
    },
    source,
    application: inputs.authorization.application,
    authorization: {
      path: path
        .relative(root, authorizationPath)
        .replaceAll('\\', '/'),
      sha256: sha256(authorizationPath),
    },
    promotionManifest: {
      path: path
        .relative(root, promotionManifestPath)
        .replaceAll('\\', '/'),
      sha256: sha256(promotionManifestPath),
    },
  };

  fs.writeFileSync(
    executionReceiptPath,
    `${JSON.stringify(receipt, null, 2)}\n`,
    'utf8',
  );

  return receipt;
}

async function createPostDeploymentVerification({
  deploymentUrl,
  receipt,
}) {
  const timeoutMs = Number(
    process.env.DEPLOYMENT_VERIFY_TIMEOUT_MS || 15000,
  );
  const expectedStatus = Number(
    process.env.DEPLOYMENT_EXPECTED_STATUS || 200,
  );
  const healthPath =
    process.env.DEPLOYMENT_HEALTH_PATH || '/';
  const healthUrl =
    `${deploymentUrl}${healthPath.startsWith('/') ? '' : '/'}${healthPath}`;

  const endpointResult = await verifyEndpoint(
    healthUrl,
    expectedStatus,
    timeoutMs,
  );

  const verification = {
    schemaVersion: 1,
    result: 'passed',
    verifiedAt: new Date().toISOString(),
    deployment: receipt.deployment,
    source: receipt.source,
    checks: {
      executionReceiptPresent: true,
      deploymentUrlReachable: true,
      expectedStatusMatched: true,
      responseCaptured: true,
      sourceCommitRecorded: true,
    },
    endpointResults: [endpointResult],
  };

  fs.writeFileSync(
    verificationPath,
    `${JSON.stringify(verification, null, 2)}\n`,
    'utf8',
  );

  return verification;
}

function createRollbackReadiness({
  inputs,
  receipt,
  verification,
}) {
  const rollbackReference =
    process.env.ROLLBACK_REFERENCE ||
    inputs.promotionManifest.source?.commit ||
    receipt.source.commit;
  const rollbackCommand =
    process.env.ROLLBACK_COMMAND ||
    'Use the deployment provider to redeploy the last known-good release.';

  const rollback = {
    schemaVersion: 1,
    result: 'ready',
    evaluatedAt: new Date().toISOString(),
    deployment: receipt.deployment,
    application: receipt.application,
    readiness: {
      ready: true,
      reference: rollbackReference,
      command: rollbackCommand,
      automaticRollbackEnabled:
        parseBoolean(
          process.env.AUTOMATIC_ROLLBACK_ENABLED,
          false,
        ),
      triggerConditions: [
        'Post-deployment health verification fails.',
        'Critical production smoke test fails.',
        'Release owner revokes authorization.',
      ],
    },
    evidence: {
      executionReceiptSha256: sha256(executionReceiptPath),
      verificationSha256: sha256(verificationPath),
      authorizationSha256: sha256(authorizationPath),
    },
    verificationResult: verification.result,
  };

  fs.writeFileSync(
    rollbackPath,
    `${JSON.stringify(rollback, null, 2)}\n`,
    'utf8',
  );

  return rollback;
}

function writeSummary({
  receipt,
  verification,
  rollback,
  authorizationChecks,
}) {
  const endpoint = verification.endpointResults[0];

  const markdown = [
    '# ServicePro Deployment Execution Summary',
    '',
    '- Execution result: **EXECUTED**',
    '- Verification result: **PASSED**',
    '- Rollback readiness: **READY**',
    `- Executed: ${receipt.executedAt}`,
    `- Environment: ${receipt.deployment.environment}`,
    `- Deployment URL: ${receipt.deployment.url}`,
    `- Deployment ID: ${receipt.deployment.deploymentId}`,
    `- Executor: ${receipt.deployment.actor}`,
    `- Commit: ${receipt.source.commit}`,
    '',
    '## Authorization checks',
    '',
    ...Object.entries(authorizationChecks).map(
      ([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
    '## Post-deployment verification',
    '',
    `- URL: ${endpoint.url}`,
    `- HTTP status: ${endpoint.status}`,
    `- Duration: ${endpoint.durationMs} ms`,
    `- Response SHA-256: ${endpoint.bodySha256}`,
    '',
    '## Rollback readiness',
    '',
    `- Ready: ${rollback.readiness.ready}`,
    `- Reference: ${rollback.readiness.reference}`,
    `- Automatic rollback enabled: ${rollback.readiness.automaticRollbackEnabled}`,
    `- Command: ${rollback.readiness.command}`,
    '',
  ].join('\n');

  if (/[^\x00-\x7F]/.test(markdown)) {
    throw new Error(
      'Deployment execution summary contains non-ASCII characters.',
    );
  }

  fs.writeFileSync(summaryPath, markdown, 'utf8');
}

async function main() {
  console.log(
    'ServicePro deployment execution, verification, and rollback readiness',
  );

  assertCleanWorkingTree();

  const source = resolveSource();
  const deploymentUrl = normalizeUrl(
    process.env.DEPLOYMENT_URL,
  );
  const inputs = validateAuthorization(source);
  const receipt = createExecutionReceipt({
    source,
    deploymentUrl,
    inputs,
  });
  const verification =
    await createPostDeploymentVerification({
      deploymentUrl,
      receipt,
    });
  const rollback = createRollbackReadiness({
    inputs,
    receipt,
    verification,
  });

  writeSummary({
    receipt,
    verification,
    rollback,
    authorizationChecks: inputs.checks,
  });

  assertCleanWorkingTree();

  console.log('');
  console.log('DEPLOYMENT EXECUTION VERIFICATION PASSED');
  console.log(`Execution receipt: ${executionReceiptPath}`);
  console.log(`Verification:      ${verificationPath}`);
  console.log(`Rollback readiness:${rollbackPath}`);
  console.log(`Summary:           ${summaryPath}`);
}

main().catch((error) => {
  fail(error.message, error);
});
