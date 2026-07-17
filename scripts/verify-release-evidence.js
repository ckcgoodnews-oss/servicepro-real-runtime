'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const buildManifestPath = path.join(
  root,
  'reports',
  'build',
  'release-manifest.json',
);
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
const evidenceManifestPath = path.join(
  releaseRoot,
  'release-evidence-manifest.json',
);
const verificationPath = path.join(
  releaseRoot,
  'release-evidence-verification.json',
);
const reproducibilityPath = path.join(
  releaseRoot,
  'release-reproducibility-report.md',
);

function fail(message, error) {
  console.error(`RELEASE EVIDENCE VERIFICATION FAILED: ${message}`);

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

function resolveSourceIdentity() {
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

function assertCleanWorkingTree() {
  const status = runGit([
    'status',
    '--porcelain',
    '--untracked-files=all',
  ]);

  if (status) {
    throw new Error(
      'Release evidence verification requires a clean working tree.\n' +
        status,
    );
  }
}

function parseChecksumFile() {
  requireFile(checksumsPath, 'Release checksum file');

  const lines = fs
    .readFileSync(checksumsPath, 'utf8')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error('Release checksum file contains no entries.');
  }

  return lines.map((line) => {
    const match = line.match(/^([0-9a-f]{64})\s{2}(.+)$/i);

    if (!match) {
      throw new Error(`Invalid checksum line: ${line}`);
    }

    return {
      sha256: match[1].toLowerCase(),
      path: match[2].replaceAll('\\', '/'),
    };
  });
}

function verifyChecksums(checksumEntries) {
  return checksumEntries.map((entry) => {
    const filePath = path.resolve(root, entry.path);

    if (!filePath.startsWith(root + path.sep)) {
      throw new Error(
        `Checksum entry escapes the repository root: ${entry.path}`,
      );
    }

    requireFile(filePath, `Checksum target ${entry.path}`);

    const actual = sha256(filePath);

    if (actual !== entry.sha256) {
      throw new Error(
        `Checksum mismatch for ${entry.path}. ` +
          `Expected ${entry.sha256}, received ${actual}.`,
      );
    }

    return {
      path: entry.path,
      expectedSha256: entry.sha256,
      actualSha256: actual,
      verified: true,
    };
  });
}

function verifyEvidenceManifest() {
  requireFile(
    evidenceManifestPath,
    'Release evidence manifest',
  );

  const manifest = readJson(evidenceManifestPath);

  if (manifest.schemaVersion !== 1) {
    throw new Error('Unsupported release evidence manifest schemaVersion.');
  }

  if (!Array.isArray(manifest.evidence) || manifest.evidence.length === 0) {
    throw new Error('Release evidence manifest has no evidence records.');
  }

  const records = manifest.evidence.map((record) => {
    const filePath = path.resolve(root, record.path);

    if (!filePath.startsWith(root + path.sep)) {
      throw new Error(
        `Evidence record escapes the repository root: ${record.path}`,
      );
    }

    const stats = requireFile(
      filePath,
      `Evidence record ${record.path}`,
    );
    const actualSha256 = sha256(filePath);

    if (stats.size !== record.sizeBytes) {
      throw new Error(
        `Evidence size mismatch for ${record.path}.`,
      );
    }

    if (actualSha256 !== record.sha256) {
      throw new Error(
        `Evidence checksum mismatch for ${record.path}.`,
      );
    }

    return {
      path: record.path,
      sizeBytes: stats.size,
      sha256: actualSha256,
      verified: true,
    };
  });

  return {
    manifest,
    records,
  };
}

function verifySourceConsistency(sourceIdentity) {
  requireFile(
    certificationPath,
    'Production certification JSON',
  );
  requireFile(
    buildManifestPath,
    'Root release manifest',
  );

  const certification = readJson(certificationPath);
  const buildManifest = readJson(buildManifestPath);

  const expectedCommit = sourceIdentity.commit;

  if (certification.result !== 'passed') {
    throw new Error('Production certification result is not passed.');
  }

  if (certification.source?.commit !== expectedCommit) {
    throw new Error(
      'Production certification commit does not match current HEAD.',
    );
  }

  if (buildManifest.source?.commit !== expectedCommit) {
    throw new Error(
      'Release build manifest commit does not match current HEAD.',
    );
  }

  if (certification.source?.workingTreeClean !== true) {
    throw new Error(
      'Production certification was generated from a dirty tree.',
    );
  }

  if (buildManifest.source?.workingTreeClean !== true) {
    throw new Error(
      'Release build manifest was generated from a dirty tree.',
    );
  }

  if (
    certification.application?.name !==
      buildManifest.application?.name ||
    certification.application?.version !==
      buildManifest.application?.version
  ) {
    throw new Error(
      'Application identity differs between certification and build manifest.',
    );
  }

  if (
    certification.build?.nextBuildId !==
    buildManifest.build?.nextBuildId
  ) {
    throw new Error(
      'Next.js build ID differs between certification and build manifest.',
    );
  }

  return {
    certification,
    buildManifest,
  };
}

function verifyArtifactReproducibility(certification, buildManifest) {
  const certifiedArtifacts = new Map(
    (certification.artifacts || []).map(
      (artifact) => [artifact.path, artifact],
    ),
  );

  const buildArtifacts = new Map(
    (buildManifest.artifacts || []).map(
      (artifact) => [artifact.path, artifact],
    ),
  );

  if (certifiedArtifacts.size === 0 || buildArtifacts.size === 0) {
    throw new Error('Artifact records are missing.');
  }

  const results = [];

  for (const [artifactPath, certified] of certifiedArtifacts) {
    const built = buildArtifacts.get(artifactPath);

    if (!built) {
      throw new Error(
        `Build manifest is missing certified artifact ${artifactPath}.`,
      );
    }

    if (
      certified.sizeBytes !== built.sizeBytes ||
      certified.sha256 !== built.sha256
    ) {
      throw new Error(
        `Artifact reproducibility mismatch for ${artifactPath}.`,
      );
    }

    results.push({
      path: artifactPath,
      sizeBytes: certified.sizeBytes,
      sha256: certified.sha256,
      reproducible: true,
    });
  }

  return results;
}

function writeVerification({
  sourceIdentity,
  checksumResults,
  evidenceResults,
  artifactResults,
  certification,
}) {
  fs.mkdirSync(releaseRoot, { recursive: true });

  const report = {
    schemaVersion: 1,
    result: 'passed',
    verifiedAt: new Date().toISOString(),
    source: {
      ...sourceIdentity,
      workingTreeClean: true,
    },
    application: certification.application,
    checks: {
      workingTreeClean: true,
      sourceCommitMatched: true,
      certificationPassed: true,
      checksumFileVerified: true,
      evidenceManifestVerified: true,
      artifactReproducibilityVerified: true,
      summaryPortable: true,
    },
    checksumResults,
    evidenceResults,
    artifactResults,
  };

  fs.writeFileSync(
    verificationPath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  const markdown = [
    '# ServicePro Release Reproducibility Report',
    '',
    '- Result: **PASSED**',
    `- Verified: ${report.verifiedAt}`,
    `- Branch: ${report.source.branch}`,
    `- Commit: ${report.source.commit}`,
    `- Application: ${report.application.name}`,
    `- Version: ${report.application.version}`,
    '',
    '## Verification checks',
    '',
    ...Object.entries(report.checks).map(
      ([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} - ${name}`,
    ),
    '',
    '## Reproducible artifacts',
    '',
    ...artifactResults.map(
      (artifact) =>
        `- ${artifact.path} - ${artifact.sizeBytes} bytes - SHA-256 ${artifact.sha256}`,
    ),
    '',
  ].join('\n');

  if (/[^\x00-\x7F]/.test(markdown)) {
    throw new Error(
      'Reproducibility report contains non-ASCII characters.',
    );
  }

  fs.writeFileSync(
    reproducibilityPath,
    markdown,
    'utf8',
  );
}

function main() {
  console.log('ServicePro release evidence verification');

  assertCleanWorkingTree();

  requireFile(summaryPath, 'Certification summary');

  const summary = fs.readFileSync(summaryPath, 'utf8');

  if (/[^\x00-\x7F]/.test(summary)) {
    throw new Error(
      'Certification summary is not portable ASCII.',
    );
  }

  const sourceIdentity = resolveSourceIdentity();
  const checksumEntries = parseChecksumFile();
  const checksumResults = verifyChecksums(checksumEntries);
  const evidence = verifyEvidenceManifest();
  const source = verifySourceConsistency(sourceIdentity);
  const artifactResults = verifyArtifactReproducibility(
    source.certification,
    source.buildManifest,
  );

  writeVerification({
    sourceIdentity,
    checksumResults,
    evidenceResults: evidence.records,
    artifactResults,
    certification: source.certification,
  });

  assertCleanWorkingTree();

  console.log('');
  console.log('RELEASE EVIDENCE VERIFICATION PASSED');
  console.log(`Verification:    ${verificationPath}`);
  console.log(`Reproducibility: ${reproducibilityPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
