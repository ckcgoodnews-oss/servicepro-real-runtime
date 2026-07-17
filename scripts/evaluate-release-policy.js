'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const provenancePath = path.join(
  releaseRoot,
  'release-provenance.json',
);
const attestationPath = path.join(
  releaseRoot,
  'release-attestation.json',
);
const verificationPath = path.join(
  releaseRoot,
  'release-evidence-verification.json',
);
const policyReportPath = path.join(
  releaseRoot,
  'release-policy-gate.json',
);
const policySummaryPath = path.join(
  releaseRoot,
  'release-policy-gate.md',
);

function fail(message, error) {
  console.error(`RELEASE POLICY GATE FAILED: ${message}`);

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
      'Release policy evaluation requires a clean working tree.\n' +
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

function loadPolicy() {
  const allowedBranches = String(
    process.env.RELEASE_ALLOWED_BRANCHES ||
      'main,release/*,codex/sprint-*',
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    allowedBranches,
    requireCi:
      parseBoolean(process.env.RELEASE_REQUIRE_CI, false),
    requireCleanTree: true,
    requirePassedVerification: true,
    requirePassedAttestation: true,
    requireExactCommitMatch: true,
    requireProvenanceDigestMatch: true,
    requireMaterials: true,
  };
}

function branchMatches(pattern, branch) {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '.*');

  return new RegExp(`^${escaped}$`).test(branch);
}

function validatePolicy({
  source,
  policy,
  provenance,
  attestation,
  verification,
}) {
  const checks = {};

  checks.workingTreeClean = true;

  checks.branchAllowed = policy.allowedBranches.some(
    (pattern) => branchMatches(pattern, source.branch),
  );

  checks.verificationPassed =
    verification.result === 'passed';

  checks.attestationPassed =
    attestation.result === 'passed';

  checks.commitMatched =
    provenance.source?.commit === source.commit &&
    attestation.predicate?.source?.commit === source.commit &&
    verification.source?.commit === source.commit;

  checks.provenanceDigestMatched =
    attestation.predicate?.provenanceSha256 ===
      sha256(provenancePath) &&
    attestation.subject?.[0]?.digest?.sha256 ===
      sha256(provenancePath);

  checks.materialsPresent =
    Array.isArray(provenance.materials) &&
    provenance.materials.length >= 3 &&
    Array.isArray(attestation.predicate?.materials) &&
    attestation.predicate.materials.length >= 3;

  checks.ciRequirementSatisfied =
    !policy.requireCi ||
    provenance.invocation?.ci === true;

  checks.applicationIdentityPresent =
    Boolean(provenance.subject?.application?.name) &&
    Boolean(provenance.subject?.application?.version);

  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failed.length > 0) {
    throw new Error(
      `Release policy checks failed: ${failed.join(', ')}`,
    );
  }

  return checks;
}

function validateMaterials(provenance) {
  return provenance.materials.map((material) => {
    const materialPath = path.resolve(root, material.uri);

    if (!materialPath.startsWith(root + path.sep)) {
      throw new Error(
        `Attestation material escapes repository root: ${material.uri}`,
      );
    }

    const stats = requireFile(
      materialPath,
      `Attestation material ${material.uri}`,
    );
    const actualSha256 = sha256(materialPath);

    if (stats.size !== material.sizeBytes) {
      throw new Error(
        `Attestation material size mismatch: ${material.uri}`,
      );
    }

    if (actualSha256 !== material.digest?.sha256) {
      throw new Error(
        `Attestation material checksum mismatch: ${material.uri}`,
      );
    }

    return {
      uri: material.uri,
      sizeBytes: stats.size,
      sha256: actualSha256,
      verified: true,
    };
  });
}

function writeReport({
  source,
  policy,
  checks,
  materials,
  provenance,
}) {
  fs.mkdirSync(releaseRoot, { recursive: true });

  const report = {
    schemaVersion: 1,
    result: 'passed',
    evaluatedAt: new Date().toISOString(),
    source: {
      ...source,
      workingTreeClean: true,
    },
    application: provenance.subject.application,
    policy,
    checks,
    materials,
    promotion: {
      eligible: true,
      reason:
        'All release provenance, attestation, and policy checks passed.',
    },
  };

  fs.writeFileSync(
    policyReportPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  const markdown = [
    '# ServicePro Release Policy Gate',
    '',
    '- Result: **PASSED**',
    '- Promotion eligible: **YES**',
    `- Evaluated: ${report.evaluatedAt}`,
    `- Application: ${report.application.name}`,
    `- Version: ${report.application.version}`,
    `- Branch: ${report.source.branch}`,
    `- Commit: ${report.source.commit}`,
    '',
    '## Policy checks',
    '',
    ...Object.entries(report.checks).map(
      ([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
    '## Verified materials',
    '',
    ...materials.map(
      (material) =>
        `- ${material.uri} - ${material.sizeBytes} bytes - SHA-256 ${material.sha256}`,
    ),
    '',
  ].join('\n');

  if (/[^\x00-\x7F]/.test(markdown)) {
    throw new Error(
      'Release policy summary contains non-ASCII characters.',
    );
  }

  fs.writeFileSync(
    policySummaryPath,
    markdown,
    'utf8',
  );
}

function main() {
  console.log('ServicePro release attestation policy gate');

  assertCleanWorkingTree();

  requireFile(provenancePath, 'Release provenance');
  requireFile(attestationPath, 'Release attestation');
  requireFile(
    verificationPath,
    'Release evidence verification',
  );

  const source = resolveSource();
  const policy = loadPolicy();
  const provenance = readJson(provenancePath);
  const attestation = readJson(attestationPath);
  const verification = readJson(verificationPath);

  const checks = validatePolicy({
    source,
    policy,
    provenance,
    attestation,
    verification,
  });

  const materials = validateMaterials(provenance);

  writeReport({
    source,
    policy,
    checks,
    materials,
    provenance,
  });

  assertCleanWorkingTree();

  console.log('');
  console.log('RELEASE POLICY GATE PASSED');
  console.log(`Report:  ${policyReportPath}`);
  console.log(`Summary: ${policySummaryPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
