'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseRoot = path.join(root, 'reports', 'release');
const verificationPath = path.join(
  releaseRoot,
  'release-evidence-verification.json',
);
const evidenceManifestPath = path.join(
  releaseRoot,
  'release-evidence-manifest.json',
);
const certificationPath = path.join(
  releaseRoot,
  'production-certification.json',
);
const provenancePath = path.join(
  releaseRoot,
  'release-provenance.json',
);
const attestationPath = path.join(
  releaseRoot,
  'release-attestation.json',
);
const summaryPath = path.join(
  releaseRoot,
  'release-attestation.md',
);

function fail(message, error) {
  console.error(`RELEASE PROVENANCE ATTESTATION FAILED: ${message}`);

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

function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalize(value[key])}`,
      )
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function digestObject(value) {
  return crypto
    .createHash('sha256')
    .update(canonicalize(value))
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
      'Release attestation requires a clean working tree.\n' +
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
  const remoteUrl = runGit([
    'config',
    '--get',
    'remote.origin.url',
  ]);

  if (!/^[0-9a-f]{40}$/i.test(commit)) {
    throw new Error(`Invalid current commit SHA: ${commit}`);
  }

  return {
    repository: remoteUrl || 'unknown',
    branch,
    commit,
    shortCommit: commit.slice(0, 7),
  };
}

function validateInputs(source) {
  requireFile(
    verificationPath,
    'Release evidence verification report',
  );
  requireFile(
    evidenceManifestPath,
    'Release evidence manifest',
  );
  requireFile(
    certificationPath,
    'Production certification',
  );

  const verification = readJson(verificationPath);
  const evidenceManifest = readJson(evidenceManifestPath);
  const certification = readJson(certificationPath);

  if (verification.result !== 'passed') {
    throw new Error(
      'Release evidence verification result is not passed.',
    );
  }

  if (certification.result !== 'passed') {
    throw new Error(
      'Production certification result is not passed.',
    );
  }

  for (const record of [
    verification,
    evidenceManifest,
    certification,
  ]) {
    if (record.source?.commit !== source.commit) {
      throw new Error(
        'Release evidence source commit does not match current HEAD.',
      );
    }
  }

  return {
    verification,
    evidenceManifest,
    certification,
  };
}

function createMaterials(inputs) {
  const files = [
    certificationPath,
    evidenceManifestPath,
    verificationPath,
  ];

  return files.map((filePath) => {
    const stats = requireFile(filePath, 'Attestation material');

    return {
      uri: path.relative(root, filePath).replaceAll('\\', '/'),
      digest: {
        sha256: sha256(filePath),
      },
      sizeBytes: stats.size,
    };
  });
}

function createProvenance(source, inputs, materials) {
  const provenance = {
    schemaVersion: 1,
    predicateType:
      'https://servicepro.example/attestation/release-provenance/v1',
    generatedAt: new Date().toISOString(),
    builder: {
      id:
        process.env.GITHUB_ACTIONS === 'true'
          ? 'github-actions'
          : 'servicepro-local',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      hostname: os.hostname(),
    },
    invocation: {
      command: 'npm run release:attest',
      ci: process.env.CI === 'true',
      githubRunId: process.env.GITHUB_RUN_ID || null,
      githubRunAttempt:
        process.env.GITHUB_RUN_ATTEMPT || null,
      githubWorkflow:
        process.env.GITHUB_WORKFLOW || null,
    },
    source,
    subject: {
      application: inputs.certification.application,
      nextBuildId:
        inputs.certification.build.nextBuildId,
    },
    materials,
    verification: {
      result: inputs.verification.result,
      verificationDigest: digestObject(
        inputs.verification,
      ),
      evidenceManifestDigest: digestObject(
        inputs.evidenceManifest,
      ),
      certificationDigest: digestObject(
        inputs.certification,
      ),
    },
  };

  fs.writeFileSync(
    provenancePath,
    `${JSON.stringify(provenance, null, 2)}\n`,
    'utf8',
  );

  return provenance;
}

function createAttestation(provenance) {
  const provenanceDigest = sha256(provenancePath);

  const attestation = {
    schemaVersion: 1,
    result: 'passed',
    attestedAt: new Date().toISOString(),
    statementType:
      'https://in-toto.io/Statement/v1',
    subject: [
      {
        name: provenance.subject.application.name,
        digest: {
          sha256: provenanceDigest,
        },
      },
    ],
    predicateType: provenance.predicateType,
    predicate: {
      provenancePath: path
        .relative(root, provenancePath)
        .replaceAll('\\', '/'),
      provenanceSha256: provenanceDigest,
      source: provenance.source,
      builder: provenance.builder,
      invocation: provenance.invocation,
      materials: provenance.materials,
    },
  };

  fs.writeFileSync(
    attestationPath,
    `${JSON.stringify(attestation, null, 2)}\n`,
    'utf8',
  );

  const markdown = [
    '# ServicePro Release Attestation',
    '',
    '- Result: **PASSED**',
    `- Attested: ${attestation.attestedAt}`,
    `- Application: ${provenance.subject.application.name}`,
    `- Version: ${provenance.subject.application.version}`,
    `- Branch: ${provenance.source.branch}`,
    `- Commit: ${provenance.source.commit}`,
    `- Builder: ${provenance.builder.id}`,
    `- CI execution: ${provenance.invocation.ci}`,
    `- Provenance SHA-256: ${provenanceDigest}`,
    '',
    '## Materials',
    '',
    ...provenance.materials.map(
      (material) =>
        `- ${material.uri} - ${material.sizeBytes} bytes - SHA-256 ${material.digest.sha256}`,
    ),
    '',
  ].join('\n');

  if (/[^\x00-\x7F]/.test(markdown)) {
    throw new Error(
      'Release attestation summary contains non-ASCII characters.',
    );
  }

  fs.writeFileSync(summaryPath, markdown, 'utf8');
}

function main() {
  console.log('ServicePro release provenance attestation');

  assertCleanWorkingTree();

  const source = resolveSource();
  const inputs = validateInputs(source);
  const materials = createMaterials(inputs);
  const provenance = createProvenance(
    source,
    inputs,
    materials,
  );

  createAttestation(provenance);

  assertCleanWorkingTree();

  console.log('');
  console.log('RELEASE PROVENANCE ATTESTATION PASSED');
  console.log(`Provenance:  ${provenancePath}`);
  console.log(`Attestation: ${attestationPath}`);
  console.log(`Summary:     ${summaryPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
