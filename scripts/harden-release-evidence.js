'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const certificationPath = path.join(
  releaseRoot,
  'production-certification.json',
);
const summaryPath = path.join(
  releaseRoot,
  'production-certification.md',
);
const checksumsPath = path.join(
  releaseRoot,
  'production-certification.sha256',
);
const bundleManifestPath = path.join(
  releaseRoot,
  'release-evidence-manifest.json',
);

function fail(message, error) {
  console.error(`RELEASE EVIDENCE HARDENING FAILED: ${message}`);

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

  return fs.statSync(filePath);
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function normalizeSummary(certification) {
  const lines = [
    '# ServicePro Production Release Certification',
    '',
    '- Result: **PASSED**',
    `- Certified: ${certification.certifiedAt}`,
    `- Application: ${certification.application.name}`,
    `- Version: ${certification.application.version}`,
    `- Branch: ${certification.source.branch}`,
    `- Commit: ${certification.source.commit}`,
    `- Next.js build ID: ${certification.build.nextBuildId}`,
    `- Public API: ${certification.build.publicApiUrl}`,
    `- CI execution: ${certification.environment.ci}`,
    '',
    '## Certified checks',
    '',
    ...Object.entries(certification.checks).map(
      ([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
    '## Certified artifacts',
    '',
    ...certification.artifacts.map(
      (artifact) =>
        `- ${artifact.path} - ${artifact.sizeBytes} bytes - SHA-256 ${artifact.sha256}`,
    ),
    '',
  ];

  const summary = lines.join('\n');

  if (/[^\x00-\x7F]/.test(summary)) {
    throw new Error(
      'Certification summary contains non-ASCII characters.',
    );
  }

  fs.writeFileSync(summaryPath, summary, {
    encoding: 'utf8',
  });
}

function validateCertification(certification) {
  if (certification.schemaVersion !== 1) {
    throw new Error('Unsupported certification schemaVersion.');
  }

  if (certification.result !== 'passed') {
    throw new Error('Certification result is not passed.');
  }

  if (certification.source?.workingTreeClean !== true) {
    throw new Error('Certification source was not clean.');
  }

  if (!/^[0-9a-f]{40}$/i.test(certification.source?.commit || '')) {
    throw new Error('Certification commit SHA is invalid.');
  }

  if (!Array.isArray(certification.artifacts)) {
    throw new Error('Certification artifacts are missing.');
  }

  for (const artifact of certification.artifacts) {
    if (!artifact.path || !artifact.sha256 || artifact.sizeBytes <= 0) {
      throw new Error('Certification contains an invalid artifact record.');
    }
  }
}

function writeChecksums() {
  const files = [
    certificationPath,
    summaryPath,
  ];

  const lines = files.map(
    (filePath) =>
      `${sha256(filePath)}  ${path
        .relative(root, filePath)
        .replaceAll('\\', '/')}`,
  );

  fs.writeFileSync(
    checksumsPath,
    `${lines.join('\n')}\n`,
    'utf8',
  );
}

function writeEvidenceManifest(certification) {
  const evidenceFiles = [
    certificationPath,
    summaryPath,
    checksumsPath,
  ];

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    application: certification.application,
    source: certification.source,
    evidence: evidenceFiles.map((filePath) => {
      const stats = requireFile(filePath, 'Release evidence file');

      return {
        path: path.relative(root, filePath).replaceAll('\\', '/'),
        sizeBytes: stats.size,
        sha256: sha256(filePath),
      };
    }),
  };

  fs.writeFileSync(
    bundleManifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );
}

function main() {
  console.log('ServicePro release evidence hardening');

  requireFile(
    certificationPath,
    'Production certification JSON',
  );

  const certification = readJson(certificationPath);

  validateCertification(certification);
  normalizeSummary(certification);
  writeChecksums();
  writeEvidenceManifest(certification);

  console.log('');
  console.log('RELEASE EVIDENCE HARDENING PASSED');
  console.log(`Summary:   ${summaryPath}`);
  console.log(`Checksums: ${checksumsPath}`);
  console.log(`Manifest:  ${bundleManifestPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
