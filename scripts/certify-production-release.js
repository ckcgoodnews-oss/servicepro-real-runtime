'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const nextRoot = path.join(root, 'apps', 'web', '.next');
const buildManifestPath = path.join(root, 'reports', 'build', 'release-manifest.json');
const releaseReportsRoot = path.join(root, 'reports', 'release');
const certificationPath = path.join(releaseReportsRoot, 'production-certification.json');
const summaryPath = path.join(releaseReportsRoot, 'production-certification.md');

const sprintTests = [
  'tests/sprint744-company-provisioning-automation.test.js',
  'tests/sprint745-local-webapp-test-harness.test.js',
  'tests/sprint746-authenticated-local-webapp-e2e.test.js',
  'tests/sprint747-root-build-orchestration.test.js',
  'tests/sprint748-production-release-certification.test.js',
];

function fail(message, error) {
  console.error(`PRODUCTION RELEASE CERTIFICATION FAILED: ${message}`);
  if (error?.stack) console.error(error.stack);
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
    throw new Error(`${description} was not found: ${path.relative(root, filePath)}`);
  }
  return fs.statSync(filePath);
}

function requireDirectory(directoryPath, description) {
  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    throw new Error(`${description} was not found: ${path.relative(root, directoryPath)}`);
  }
  return fs.statSync(directoryPath);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
    shell: false,
    stdio: options.captureOutput ? 'pipe' : 'inherit',
    windowsHide: true,
  });

  if (result.error) {
    throw new Error(`${command} could not be started: ${result.error.message}`);
  }

  if (result.status !== 0) {
    if (options.captureOutput) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    throw new Error(`${command} failed with exit code ${result.status}`);
  }

  return result;
}

function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    process.env.NPM_CLI_JS,
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), '..', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.endsWith('.js') && fs.existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  throw new Error('Unable to locate npm-cli.js. Run through npm, or set NPM_CLI_JS.');
}

function runNpm(args, options = {}) {
  return run(process.execPath, [resolveNpmCli(), ...args], options);
}

function getGit(args) {
  const result = run('git', args, { captureOutput: true });
  return String(result.stdout || '').trim();
}

function calculateSha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function assertCleanWorkingTree() {
  const status = getGit(['status', '--porcelain', '--untracked-files=all']);
  if (status) {
    throw new Error(
      'The working tree is not clean. Commit or discard all source changes before running production certification.\n' +
      status,
    );
  }
}

function resolveSourceIdentity() {
  const branch =
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    getGit(['branch', '--show-current']) ||
    'detached';
  const commit = getGit(['rev-parse', 'HEAD']);

  if (!/^[0-9a-f]{40}$/i.test(commit)) {
    throw new Error(`Unable to resolve a valid commit SHA: ${commit}`);
  }

  return { branch, commit, shortCommit: commit.slice(0, 7) };
}

function runSprintTests() {
  for (const relativeTestPath of sprintTests) {
    const testPath = path.join(root, relativeTestPath);
    requireFile(testPath, `Sprint test ${relativeTestPath}`);
    run(process.execPath, [testPath]);
  }
}

function runReleaseBuild() {
  runNpm(['run', 'build:render:verify']);
  runNpm(['run', 'build'], {
    env: {
      NODE_ENV: 'production',
      ALLOW_LOCAL_PRODUCTION_BUILD: process.env.ALLOW_LOCAL_PRODUCTION_BUILD || 'true',
      NEXT_PUBLIC_API_BASE_URL:
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3000',
    },
  });
}

function validateNextArtifacts() {
  requireDirectory(nextRoot, 'Next.js production output');

  const artifactPaths = [
    path.join(nextRoot, 'BUILD_ID'),
    path.join(nextRoot, 'build-manifest.json'),
    path.join(nextRoot, 'routes-manifest.json'),
    path.join(nextRoot, 'required-server-files.json'),
  ];

  return artifactPaths.map((filePath) => {
    const stats = requireFile(filePath, 'Required Next.js artifact');
    if (stats.size <= 0) {
      throw new Error(`Required Next.js artifact is empty: ${path.relative(root, filePath)}`);
    }
    return {
      path: path.relative(root, filePath).replaceAll('\\', '/'),
      sizeBytes: stats.size,
      sha256: calculateSha256(filePath),
    };
  });
}

function validateReleaseManifest(sourceIdentity, nextArtifacts) {
  requireFile(buildManifestPath, 'Root release manifest');
  const manifest = readJson(buildManifestPath);

  if (manifest.schemaVersion !== 1) {
    throw new Error('Unsupported release manifest schemaVersion.');
  }
  if (manifest.source?.commit !== sourceIdentity.commit) {
    throw new Error('Release manifest commit does not match the current HEAD commit.');
  }
  if (manifest.source?.workingTreeClean !== true) {
    throw new Error('Release manifest was generated from a dirty working tree.');
  }

  const requiredChecks = [
    'apiSyntaxValidated',
    'webTypecheckPassed',
    'webProductionBuildPassed',
    'renderConfigurationVerified',
    'artifactsVerified',
  ];
  for (const check of requiredChecks) {
    if (manifest.certification?.[check] !== true) {
      throw new Error(`Release manifest check failed: ${check}`);
    }
  }

  if (manifest.build?.nodeEnvironment !== 'production') {
    throw new Error('Release manifest was not generated in production application mode.');
  }

  const manifestArtifacts = new Map(
    (manifest.artifacts || []).map((artifact) => [artifact.path, artifact]),
  );

  for (const artifact of nextArtifacts) {
    const recorded = manifestArtifacts.get(artifact.path);
    if (!recorded) {
      throw new Error(`Release manifest does not include artifact ${artifact.path}.`);
    }
    if (recorded.sizeBytes !== artifact.sizeBytes || recorded.sha256 !== artifact.sha256) {
      throw new Error(`Release manifest artifact verification failed for ${artifact.path}.`);
    }
  }

  return manifest;
}

function writeCertification({ applicationPackage, sourceIdentity, releaseManifest, nextArtifacts }) {
  fs.mkdirSync(releaseReportsRoot, { recursive: true });

  const certification = {
    schemaVersion: 1,
    result: 'passed',
    certifiedAt: new Date().toISOString(),
    application: {
      name: applicationPackage.name,
      version: applicationPackage.version,
    },
    source: {
      ...sourceIdentity,
      workingTreeClean: true,
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      ci: process.env.CI === 'true',
    },
    checks: {
      workingTreeClean: true,
      sourceIdentityVerified: true,
      sprint744Passed: true,
      sprint745Passed: true,
      sprint746Passed: true,
      sprint747Passed: true,
      sprint748Passed: true,
      renderDeploymentVerified: true,
      rootProductionBuildPassed: true,
      nextArtifactsVerified: true,
      releaseManifestVerified: true,
    },
    build: {
      nextBuildId: releaseManifest.build.nextBuildId,
      publicApiUrl: releaseManifest.build.publicApiUrl,
      manifestPath: path.relative(root, buildManifestPath).replaceAll('\\', '/'),
      manifestSha256: calculateSha256(buildManifestPath),
    },
    artifacts: nextArtifacts,
  };

  fs.writeFileSync(certificationPath, `${JSON.stringify(certification, null, 2)}\n`, 'utf8');

  const summary = [
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
      ([name, passed]) => `- ${passed ? 'PASS' : 'FAIL'} — ${name}`,
    ),
    '',
    '## Certified artifacts',
    '',
    ...certification.artifacts.map(
      (artifact) =>
        `- ${artifact.path} — ${artifact.sizeBytes} bytes — SHA-256 ${artifact.sha256}`,
    ),
    '',
  ].join('\n');

  fs.writeFileSync(summaryPath, summary, 'utf8');
}

function main() {
  console.log('ServicePro production release certification');
  console.log(`Repository: ${root}`);

  requireFile(packagePath, 'Root package.json');
  assertCleanWorkingTree();

  const sourceIdentity = resolveSourceIdentity();
  console.log(`Branch:     ${sourceIdentity.branch}`);
  console.log(`Commit:     ${sourceIdentity.commit}`);

  runSprintTests();
  runReleaseBuild();

  const nextArtifacts = validateNextArtifacts();
  const releaseManifest = validateReleaseManifest(sourceIdentity, nextArtifacts);
  const applicationPackage = readJson(packagePath);

  writeCertification({
    applicationPackage,
    sourceIdentity,
    releaseManifest,
    nextArtifacts,
  });

  assertCleanWorkingTree();

  console.log('');
  console.log('PRODUCTION RELEASE CERTIFICATION PASSED');
  console.log(`Certification: ${certificationPath}`);
  console.log(`Summary:       ${summaryPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}
