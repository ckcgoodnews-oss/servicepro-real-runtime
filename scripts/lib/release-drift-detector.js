'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_REQUIRED_FIELDS = [
  'releaseId',
  'version',
  'sourceCommit',
  'artifactDigest',
  'environment',
];

function normalize(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function digestJson(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}

function readJson(filePath, label) {
  if (!filePath || !fs.existsSync(filePath)) {
    return {
      ok: false,
      error: `${label} not found`,
      value: null,
    };
  }

  try {
    return {
      ok: true,
      error: null,
      value: JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')),
    };
  } catch (error) {
    return {
      ok: false,
      error: `${label} is not valid JSON: ${error.message}`,
      value: null,
    };
  }
}

function selectTrustedRelease(registry) {
  if (!registry || typeof registry !== 'object') {
    return null;
  }

  if (registry.trustedRelease && typeof registry.trustedRelease === 'object') {
    return registry.trustedRelease;
  }

  if (registry.release && typeof registry.release === 'object') {
    return registry.release;
  }

  if (Array.isArray(registry.releases)) {
    return (
      registry.releases.find((entry) => entry && entry.status === 'trusted') ||
      registry.releases.find((entry) => entry && entry.trusted === true) ||
      registry.releases[registry.releases.length - 1] ||
      null
    );
  }

  return registry;
}

function valueFromAliases(source, aliases) {
  for (const alias of aliases) {
    if (source && source[alias] !== undefined && source[alias] !== null) {
      return normalize(source[alias]);
    }
  }
  return null;
}

function canonicalRelease(source) {
  return {
    releaseId: valueFromAliases(source, ['releaseId', 'release_id', 'id']),
    version: valueFromAliases(source, ['version', 'appVersion', 'app_version']),
    sourceCommit: valueFromAliases(source, [
      'sourceCommit',
      'source_commit',
      'commitSha',
      'commit_sha',
      'gitCommit',
      'git_commit',
    ]),
    artifactDigest: valueFromAliases(source, [
      'artifactDigest',
      'artifact_digest',
      'bundleDigest',
      'bundle_digest',
      'sha256',
      'digest',
    ]),
    environment: valueFromAliases(source, [
      'environment',
      'targetEnvironment',
      'target_environment',
      'deploymentEnvironment',
      'deployment_environment',
    ]),
  };
}

function buildRuntimeEvidence({ packageJson, env = process.env }) {
  return canonicalRelease({
    releaseId:
      env.RELEASE_ID ||
      env.SERVICEPRO_RELEASE_ID ||
      env.RENDER_GIT_COMMIT ||
      null,
    version:
      env.APP_VERSION ||
      env.SERVICEPRO_VERSION ||
      (packageJson && packageJson.version) ||
      null,
    sourceCommit:
      env.GIT_COMMIT_SHA ||
      env.RENDER_GIT_COMMIT ||
      env.COMMIT_SHA ||
      env.SOURCE_COMMIT ||
      null,
    artifactDigest:
      env.RELEASE_ARTIFACT_DIGEST ||
      env.ARTIFACT_DIGEST ||
      env.RELEASE_BUNDLE_DIGEST ||
      null,
    environment:
      env.DEPLOYMENT_ENVIRONMENT ||
      env.RENDER_SERVICE_NAME ||
      env.NODE_ENV ||
      null,
  });
}

function compareReleaseEvidence({
  expected,
  actual,
  requiredFields = DEFAULT_REQUIRED_FIELDS,
}) {
  const checks = {};
  const missingExpected = [];
  const missingActual = [];
  const mismatches = [];

  for (const field of requiredFields) {
    const expectedValue = normalize(expected && expected[field]);
    const actualValue = normalize(actual && actual[field]);

    if (expectedValue === null || expectedValue === undefined || expectedValue === '') {
      missingExpected.push(field);
    }

    if (actualValue === null || actualValue === undefined || actualValue === '') {
      missingActual.push(field);
    }

    const matched =
      expectedValue !== null &&
      expectedValue !== undefined &&
      expectedValue !== '' &&
      actualValue !== null &&
      actualValue !== undefined &&
      actualValue !== '' &&
      String(expectedValue) === String(actualValue);

    checks[field] = {
      matched,
      expectedPresent:
        expectedValue !== null && expectedValue !== undefined && expectedValue !== '',
      actualPresent:
        actualValue !== null && actualValue !== undefined && actualValue !== '',
      expectedDigest: expectedValue ? digestJson(String(expectedValue)) : null,
      actualDigest: actualValue ? digestJson(String(actualValue)) : null,
    };

    if (
      checks[field].expectedPresent &&
      checks[field].actualPresent &&
      !matched
    ) {
      mismatches.push(field);
    }
  }

  let status = 'aligned';
  if (missingExpected.length > 0) {
    status = 'evidence_missing';
  } else if (missingActual.length > 0) {
    status = 'unknown';
  } else if (mismatches.length > 0) {
    status = 'drifted';
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status,
    aligned: status === 'aligned',
    failClosed: status !== 'aligned',
    checks,
    missingExpected,
    missingActual,
    mismatches,
  };
}

function resolvePaths({ rootDir, env = process.env }) {
  const evidenceDir = path.resolve(
    rootDir,
    env.RELEASE_EVIDENCE_DIR || 'release-evidence',
  );

  return {
    evidenceDir,
    registryPath: path.resolve(
      rootDir,
      env.TRUSTED_RELEASE_REGISTRY_PATH ||
        path.join('release-evidence', 'trusted-release-registry.json'),
    ),
    trustedEntryPath: path.resolve(
      rootDir,
      env.TRUSTED_RELEASE_ENTRY_PATH ||
        path.join('release-evidence', 'trusted-release-entry.json'),
    ),
    runtimeEvidencePath: env.RUNTIME_RELEASE_EVIDENCE_PATH
      ? path.resolve(rootDir, env.RUNTIME_RELEASE_EVIDENCE_PATH)
      : null,
    outputPath: path.resolve(
      rootDir,
      env.RELEASE_DRIFT_REPORT_PATH ||
        path.join('release-evidence', 'production-release-drift-report.json'),
    ),
  };
}

function loadExpectedRelease(paths) {
  const trustedEntry = readJson(
    paths.trustedEntryPath,
    'trusted release entry',
  );

  if (trustedEntry.ok) {
    return {
      ok: true,
      source: paths.trustedEntryPath,
      release: canonicalRelease(selectTrustedRelease(trustedEntry.value)),
      raw: trustedEntry.value,
    };
  }

  const registry = readJson(paths.registryPath, 'trusted release registry');
  if (registry.ok) {
    return {
      ok: true,
      source: paths.registryPath,
      release: canonicalRelease(selectTrustedRelease(registry.value)),
      raw: registry.value,
    };
  }

  return {
    ok: false,
    source: null,
    release: canonicalRelease({}),
    raw: null,
    error: `${trustedEntry.error}; ${registry.error}`,
  };
}

function loadActualRelease({ rootDir, paths, env = process.env }) {
  if (paths.runtimeEvidencePath) {
    const runtimeEvidence = readJson(
      paths.runtimeEvidencePath,
      'runtime release evidence',
    );

    if (runtimeEvidence.ok) {
      return {
        ok: true,
        source: paths.runtimeEvidencePath,
        release: canonicalRelease(runtimeEvidence.value),
      };
    }

    return {
      ok: false,
      source: paths.runtimeEvidencePath,
      release: canonicalRelease({}),
      error: runtimeEvidence.error,
    };
  }

  const packageResult = readJson(
    path.join(rootDir, 'package.json'),
    'package.json',
  );

  return {
    ok: true,
    source: 'environment/package.json',
    release: buildRuntimeEvidence({
      packageJson: packageResult.ok ? packageResult.value : {},
      env,
    }),
  };
}

function writeReport(outputPath, report) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function runDriftDetection({
  rootDir = path.resolve(__dirname, '../../..'),
  env = process.env,
} = {}) {
  const paths = resolvePaths({ rootDir, env });
  const expected = loadExpectedRelease(paths);
  const actual = loadActualRelease({ rootDir, paths, env });

  const comparison = compareReleaseEvidence({
    expected: expected.release,
    actual: actual.release,
  });

  const report = {
    ...comparison,
    sprint: 758,
    control: 'production-release-drift-detection',
    expectedEvidenceSource: expected.source,
    actualEvidenceSource: actual.source,
    evidenceLoadErrors: [expected.error, actual.error].filter(Boolean),
    expectedReleaseFingerprint: digestJson(expected.release),
    actualReleaseFingerprint: digestJson(actual.release),
  };

  if (!expected.ok) {
    report.status = 'evidence_missing';
    report.aligned = false;
    report.failClosed = true;
  } else if (!actual.ok && report.status === 'aligned') {
    report.status = 'unknown';
    report.aligned = false;
    report.failClosed = true;
  }

  writeReport(paths.outputPath, report);

  return {
    report,
    outputPath: paths.outputPath,
  };
}

module.exports = {
  DEFAULT_REQUIRED_FIELDS,
  buildRuntimeEvidence,
  canonicalRelease,
  compareReleaseEvidence,
  digestJson,
  loadActualRelease,
  loadExpectedRelease,
  readJson,
  resolvePaths,
  runDriftDetection,
  selectTrustedRelease,
  writeReport,
};
