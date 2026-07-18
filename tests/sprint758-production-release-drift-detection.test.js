'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const detectorPath = path.join(
  root,
  'scripts',
  'lib',
  'release-drift-detector.js',
);

for (const file of [
  'scripts/lib/release-drift-detector.js',
  'scripts/check-production-release-drift.js',
  'docs/sprint758-production-release-drift-detection.md',
]) {
  assert.ok(
    fs.existsSync(path.join(root, file)),
    `Missing Sprint 758 file: ${file}`,
  );
}

const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8').replace(/^\uFEFF/, ''),
);

assert.strictEqual(
  packageJson.scripts['release:drift-check'],
  'node scripts/check-production-release-drift.js',
);

assert.strictEqual(
  packageJson.scripts['test:sprint758'],
  'node tests/sprint758-production-release-drift-detection.test.js',
);

const {
  canonicalRelease,
  compareReleaseEvidence,
  runDriftDetection,
} = require(detectorPath);

const expected = canonicalRelease({
  releaseId: 'release-758',
  version: '8.0.0-alpha.1',
  sourceCommit: 'abc123',
  artifactDigest: 'sha256:trusted',
  environment: 'production',
});

assert.strictEqual(
  compareReleaseEvidence({ expected, actual: { ...expected } }).status,
  'aligned',
);

const drifted = compareReleaseEvidence({
  expected,
  actual: {
    ...expected,
    artifactDigest: 'sha256:unexpected',
  },
});

assert.strictEqual(drifted.status, 'drifted');
assert.deepStrictEqual(drifted.mismatches, ['artifactDigest']);
assert.strictEqual(drifted.failClosed, true);

const unknown = compareReleaseEvidence({
  expected,
  actual: {
    ...expected,
    sourceCommit: null,
  },
});

assert.strictEqual(unknown.status, 'unknown');
assert.deepStrictEqual(unknown.missingActual, ['sourceCommit']);

const evidenceMissing = compareReleaseEvidence({
  expected: {
    ...expected,
    releaseId: null,
  },
  actual: { ...expected },
});

assert.strictEqual(evidenceMissing.status, 'evidence_missing');
assert.deepStrictEqual(evidenceMissing.missingExpected, ['releaseId']);

const tempRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), 'servicepro-sprint758-'),
);

try {
  fs.mkdirSync(path.join(tempRoot, 'release-evidence'), { recursive: true });
  fs.writeFileSync(
    path.join(tempRoot, 'package.json'),
    JSON.stringify({ version: expected.version }, null, 2),
  );
  fs.writeFileSync(
    path.join(tempRoot, 'release-evidence', 'trusted-release-entry.json'),
    JSON.stringify(expected, null, 2),
  );

  const result = runDriftDetection({
    rootDir: tempRoot,
    env: {
      RELEASE_ID: expected.releaseId,
      APP_VERSION: expected.version,
      GIT_COMMIT_SHA: expected.sourceCommit,
      RELEASE_ARTIFACT_DIGEST: expected.artifactDigest,
      DEPLOYMENT_ENVIRONMENT: expected.environment,
    },
  });

  assert.strictEqual(result.report.status, 'aligned');
  assert.ok(fs.existsSync(result.outputPath));

  const written = JSON.parse(fs.readFileSync(result.outputPath, 'utf8'));
  assert.strictEqual(written.sprint, 758);
  assert.strictEqual(written.control, 'production-release-drift-detection');
  assert.ok(written.expectedReleaseFingerprint);
  assert.ok(written.actualReleaseFingerprint);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

const detectorSource = fs.readFileSync(detectorPath, 'utf8');

for (const requiredText of [
  'production-release-drift-report.json',
  'evidence_missing',
  'artifactDigest',
  'sourceCommit',
  'failClosed',
  'expectedReleaseFingerprint',
  'actualReleaseFingerprint',
]) {
  assert.ok(
    detectorSource.includes(requiredText),
    `Drift detector missing: ${requiredText}`,
  );
}

console.log(
  'Sprint 758 production release drift detection test passed.',
);
