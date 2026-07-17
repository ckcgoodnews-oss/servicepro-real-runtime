'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const webRoot = path.join(root, 'apps', 'web');
const webBuildRoot = path.join(webRoot, '.next');
const reportsRoot = path.join(root, 'reports', 'build');
const manifestPath = path.join(reportsRoot, 'release-manifest.json');

function fail(message, error) {
  console.error(`ROOT PRODUCTION BUILD FAILED: ${message}`);

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

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function removeDirectory(directoryPath) {
  fs.rmSync(directoryPath, {
    recursive: true,
    force: true,
  });
}

function requireFile(filePath, description) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${description} was not found: ${path.relative(root, filePath)}`,
    );
  }

  const stats = fs.statSync(filePath);

  if (!stats.isFile()) {
    throw new Error(
      `${description} is not a file: ${path.relative(root, filePath)}`,
    );
  }

  return stats;
}

function requireDirectory(directoryPath, description) {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(
      `${description} was not found: ${path.relative(root, directoryPath)}`,
    );
  }

  const stats = fs.statSync(directoryPath);

  if (!stats.isDirectory()) {
    throw new Error(
      `${description} is not a directory: ${path.relative(
        root,
        directoryPath,
      )}`,
    );
  }

  return stats;
}

function quoteForDisplay(value) {
  const text = String(value);

  if (text.includes(' ') || text.includes('"')) {
    return `"${text.replaceAll('"', '\\"')}"`;
  }

  return text;
}

function getCommandDisplay(command, args) {
  return [command, ...args]
    .map(quoteForDisplay)
    .join(' ');
}

/**
 * Execute an executable directly without a shell.
 *
 * The executable and arguments are passed separately, which prevents
 * Windows paths such as C:\Program Files\nodejs\node.exe from being split.
 */
function run(command, args, options = {}) {
  if (!Array.isArray(args)) {
    throw new TypeError('run() requires an argument array.');
  }

  const displayCommand = getCommandDisplay(command, args);

  console.log('');
  console.log(`> ${displayCommand}`);

  const result = spawnSync(command, args, {
    cwd: options.cwd || root,
    env: {
      ...process.env,
      ...(options.env || {}),
    },
    encoding: 'utf8',
    shell: false,
    stdio: options.captureOutput ? 'pipe' : 'inherit',
    windowsHide: true,
  });

  if (result.error) {
    throw new Error(
      `${displayCommand} could not be started: ${result.error.message}`,
    );
  }

  if (result.status !== 0) {
    if (options.captureOutput) {
      if (result.stdout) {
        process.stdout.write(result.stdout);
      }

      if (result.stderr) {
        process.stderr.write(result.stderr);
      }
    }

    throw new Error(
      `${displayCommand} failed with exit code ${result.status}`,
    );
  }

  return result;
}

/**
 * Resolve npm's JavaScript CLI.
 *
 * On Windows, directly spawning npm.cmd with shell:false can throw EINVAL.
 * Running npm-cli.js through the current Node executable avoids that issue.
 */
function resolveNpmCli() {
  const candidates = [];

  if (process.env.npm_execpath) {
    candidates.push(process.env.npm_execpath);
  }

  if (process.env.NPM_CLI_JS) {
    candidates.push(process.env.NPM_CLI_JS);
  }

  candidates.push(
    path.join(
      path.dirname(process.execPath),
      'node_modules',
      'npm',
      'bin',
      'npm-cli.js',
    ),
  );

  candidates.push(
    path.join(
      path.dirname(process.execPath),
      '..',
      'node_modules',
      'npm',
      'bin',
      'npm-cli.js',
    ),
  );

  candidates.push(
    path.join(
      process.env.APPDATA || '',
      'npm',
      'node_modules',
      'npm',
      'bin',
      'npm-cli.js',
    ),
  );

  for (const candidate of candidates) {
    if (
      candidate &&
      candidate.endsWith('.js') &&
      fs.existsSync(candidate)
    ) {
      return path.resolve(candidate);
    }
  }

  throw new Error(
    'Unable to locate npm-cli.js. Run this build through npm run build, ' +
      'or set NPM_CLI_JS to the full path of npm-cli.js.',
  );
}

function runNpm(args, options = {}) {
  const npmCli = resolveNpmCli();

  return run(
    process.execPath,
    [npmCli, ...args],
    options,
  );
}

function getGitValue(args, fallback = '') {
  const result = spawnSync('git', args, {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    return fallback;
  }

  return String(result.stdout || '').trim() || fallback;
}

function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function createArtifactRecord(filePath) {
  const stats = requireFile(filePath, 'Build artifact');

  return {
    path: path.relative(root, filePath).replaceAll('\\', '/'),
    sizeBytes: stats.size,
    sha256: calculateSha256(filePath),
  };
}

function validateNodeVersion() {
  const nodeMajor = Number.parseInt(
    process.versions.node.split('.')[0],
    10,
  );

  if (!Number.isInteger(nodeMajor) || nodeMajor < 20) {
    throw new Error(
      `Node.js 20 or newer is required. Current version: ${process.version}`,
    );
  }

  return nodeMajor;
}

function validateEnvironment() {
  const nodeEnvironment = process.env.NODE_ENV || 'development';

  const publicApiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';

  let parsedApiUrl;

  try {
    parsedApiUrl = new URL(publicApiUrl);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL is invalid: ${publicApiUrl}`,
    );
  }

  if (!['http:', 'https:'].includes(parsedApiUrl.protocol)) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL must use HTTP or HTTPS.',
    );
  }

  const allowLocalProduction =
    String(process.env.ALLOW_LOCAL_PRODUCTION_BUILD || '')
      .trim()
      .toLowerCase() === 'true';

  if (
    nodeEnvironment === 'production' &&
    !allowLocalProduction &&
    ['localhost', '127.0.0.1', '::1'].includes(parsedApiUrl.hostname)
  ) {
    throw new Error(
      'A production build cannot target localhost. Set ' +
        'NEXT_PUBLIC_API_BASE_URL to the deployed API URL, or set ' +
        'ALLOW_LOCAL_PRODUCTION_BUILD=true for an intentional local test.',
    );
  }

  return {
    nodeEnvironment,
    publicApiUrl: parsedApiUrl.toString().replace(/\/$/, ''),
  };
}

function validateProjectFiles() {
  requireFile(packagePath, 'Root package.json');
  requireDirectory(webRoot, 'Next.js application directory');

  requireFile(
    path.join(root, 'apps', 'api', 'src', 'server.js'),
    'API production entry point',
  );

  requireFile(
    path.join(webRoot, 'package.json'),
    'Web application package.json',
  );

  requireFile(
    path.join(root, 'render.yaml'),
    'Render blueprint',
  );

  requireFile(
    path.join(root, 'Dockerfile'),
    'Production Dockerfile',
  );

  requireFile(
    path.join(root, 'scripts', 'verify-render-deployment.js'),
    'Render deployment verification script',
  );
}

function validateApi() {
  const apiEntry = path.join(
    root,
    'apps',
    'api',
    'src',
    'server.js',
  );

  run(process.execPath, ['--check', apiEntry]);
}

function buildWebApplication(environment) {
  const buildEnvironment = {
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_BASE_URL: environment.publicApiUrl,
    NEXT_PUBLIC_API_URL: environment.publicApiUrl,
  };

  runNpm(
    ['--prefix', 'apps/web', 'run', 'typecheck'],
    {
      env: buildEnvironment,
    },
  );

  removeDirectory(webBuildRoot);

  runNpm(
    ['--prefix', 'apps/web', 'run', 'build'],
    {
      env: buildEnvironment,
    },
  );
}

function verifyNextArtifacts() {
  requireDirectory(webBuildRoot, 'Next.js production output');

  const buildIdPath = path.join(webBuildRoot, 'BUILD_ID');
  const buildManifestPath = path.join(
    webBuildRoot,
    'build-manifest.json',
  );
  const routesManifestPath = path.join(
    webBuildRoot,
    'routes-manifest.json',
  );
  const requiredServerFilesPath = path.join(
    webBuildRoot,
    'required-server-files.json',
  );

  requireFile(buildIdPath, 'Next.js BUILD_ID');
  requireFile(buildManifestPath, 'Next.js build manifest');
  requireFile(routesManifestPath, 'Next.js routes manifest');
  requireFile(
    requiredServerFilesPath,
    'Next.js required server files manifest',
  );

  const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();

  if (!buildId) {
    throw new Error('Next.js BUILD_ID is empty.');
  }

  const buildManifest = readJson(buildManifestPath);
  const routesManifest = readJson(routesManifestPath);
  const requiredServerFiles = readJson(requiredServerFilesPath);

  if (
    !buildManifest ||
    typeof buildManifest !== 'object'
  ) {
    throw new Error('Next.js build-manifest.json is invalid.');
  }

  if (
    !routesManifest ||
    !Array.isArray(routesManifest.staticRoutes)
  ) {
    throw new Error('Next.js routes-manifest.json is invalid.');
  }

  if (
    !requiredServerFiles ||
    !Array.isArray(requiredServerFiles.files)
  ) {
    throw new Error(
      'Next.js required-server-files.json is invalid.',
    );
  }

  return {
    buildId,
    artifactFiles: [
      buildIdPath,
      buildManifestPath,
      routesManifestPath,
      requiredServerFilesPath,
    ],
  };
}

function verifyRenderDeployment() {
  run(process.execPath, [
    path.join(root, 'scripts', 'verify-render-deployment.js'),
  ]);
}

function writeReleaseManifest({
  applicationPackage,
  environment,
  nodeMajor,
  nextArtifacts,
}) {
  ensureDirectory(reportsRoot);

  const commit = getGitValue(
    ['rev-parse', 'HEAD'],
    'unknown',
  );

  const shortCommit = getGitValue(
    ['rev-parse', '--short', 'HEAD'],
    'unknown',
  );

  const branch = getGitValue(
    ['branch', '--show-current'],
    'detached',
  );

  const repositoryStatus = getGitValue(
    ['status', '--porcelain'],
    '',
  );

  const manifest = {
    schemaVersion: 1,
    application: {
      name: applicationPackage.name,
      version: applicationPackage.version,
    },
    build: {
      completedAt: new Date().toISOString(),
      nodeEnvironment: environment.nodeEnvironment,
      nodeVersion: process.version,
      nodeMajor,
      platform: process.platform,
      architecture: process.arch,
      publicApiUrl: environment.publicApiUrl,
      nextBuildId: nextArtifacts.buildId,
    },
    source: {
      commit,
      shortCommit,
      branch,
      workingTreeClean: repositoryStatus.length === 0,
    },
    certification: {
      apiSyntaxValidated: true,
      webTypecheckPassed: true,
      webProductionBuildPassed: true,
      renderConfigurationVerified: true,
      artifactsVerified: true,
    },
    artifacts: nextArtifacts.artifactFiles.map(
      createArtifactRecord,
    ),
  };

  const json = `${JSON.stringify(manifest, null, 2)}\n`;

  fs.writeFileSync(manifestPath, json, {
    encoding: 'utf8',
  });

  return manifest;
}

function main() {
  console.log('ServicePro root production build');
  console.log(`Repository: ${root}`);
  console.log(`Node:       ${process.version}`);

  const nodeMajor = validateNodeVersion();

  validateProjectFiles();

  const applicationPackage = readJson(packagePath);
  const environment = validateEnvironment();

  console.log(`Version:     ${applicationPackage.version}`);
  console.log(`Environment: ${environment.nodeEnvironment}`);
  console.log(`Public API:  ${environment.publicApiUrl}`);

  validateApi();
  buildWebApplication(environment);

  const nextArtifacts = verifyNextArtifacts();

  verifyRenderDeployment();

  writeReleaseManifest({
    applicationPackage,
    environment,
    nodeMajor,
    nextArtifacts,
  });

  console.log('');
  console.log('ROOT PRODUCTION BUILD PASSED');
  console.log(`Manifest: ${manifestPath}`);
}

try {
  main();
} catch (error) {
  fail(error.message, error);
}