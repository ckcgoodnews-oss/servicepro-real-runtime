[CmdletBinding()]
param(
    [string]$ProjectRoot = 'I:\REPO\servicepro-cumulative'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Write-Step {
    param([string]$Message)

    Write-Host ''
    Write-Host "==> $Message" -ForegroundColor Cyan
}

Write-Step "Validating project directory"

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    throw "Project directory does not exist: $ProjectRoot"
}

Set-Location -LiteralPath $ProjectRoot

$packagePath = Join-Path $ProjectRoot 'package.json'
$healthServicePath = Join-Path `
    $ProjectRoot `
    'apps\api\src\services\healthService.js'

if (-not (Test-Path -LiteralPath $packagePath -PathType Leaf)) {
    throw "package.json was not found: $packagePath"
}

if (-not (Test-Path -LiteralPath $healthServicePath -PathType Leaf)) {
    throw "healthService.js was not found: $healthServicePath"
}

Write-Step "Creating backups"

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDirectory = Join-Path $ProjectRoot ".patch-backups\$timestamp"

New-Item `
    -ItemType Directory `
    -Path $backupDirectory `
    -Force |
    Out-Null

Copy-Item `
    -LiteralPath $packagePath `
    -Destination (Join-Path $backupDirectory 'package.json') `
    -Force

Copy-Item `
    -LiteralPath $healthServicePath `
    -Destination (Join-Path $backupDirectory 'healthService.js') `
    -Force

Write-Step "Replacing healthService.js"

$healthServiceContent = @'
'use strict';

const { version: packageVersion } = require('../../../../package.json');
const { validateRuntimeConfig } = require('./configValidationService');
const { getRepositories } = require('../repositories/repositoryFactory');

function resolveApplicationVersion() {
  const environmentVersion =
    typeof process.env.APP_VERSION === 'string'
      ? process.env.APP_VERSION.trim()
      : '';

  return environmentVersion || packageVersion;
}

function buildHealth() {
  const environmentVersion =
    typeof process.env.APP_VERSION === 'string'
      ? process.env.APP_VERSION.trim()
      : '';

  return {
    ok: true,
    app: process.env.APP_NAME || 'ServicePro',
    version: environmentVersion || packageVersion,
    versionSource: environmentVersion ? 'APP_VERSION' : 'package.json',
    packageVersion,
    environmentVersion: environmentVersion || null,
    environment: process.env.NODE_ENV || 'development',
    store: process.env.DATA_STORE || 'json',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  };
}

async function buildReadiness(options = {}) {
  const configuration =
    options.configuration || validateRuntimeConfig();

  const repositories =
    options.repositories || getRepositories();

  const store =
    options.store || repositories.store;

  let dataStoreReady = false;

  try {
    if (!store) {
      throw new Error('Repository store is not configured');
    }

    if (store.type === 'postgres') {
      if (typeof store.query !== 'function') {
        throw new Error('PostgreSQL store does not provide query()');
      }

      await store.query('SELECT 1 AS ready');
    } else if (typeof store.read === 'function') {
      await Promise.resolve(store.read());
    } else {
      throw new Error(
        `Unsupported data store readiness interface: ${
          store.type || 'unknown'
        }`
      );
    }

    dataStoreReady = true;
  } catch (error) {
    dataStoreReady = false;
  }

  const checks = {
    configuration: Boolean(configuration && configuration.ok),
    runtime: true,
    dataStore: dataStoreReady
  };

  const configurationErrors = Array.isArray(configuration?.errors)
    ? configuration.errors
    : [];

  const configurationWarnings = Array.isArray(configuration?.warnings)
    ? configuration.warnings
    : [];

  const issues = [...configurationErrors];

  if (!dataStoreReady) {
    issues.push('Data store check failed');
  }

  return {
    ready: Object.values(checks).every(Boolean),
    checks,
    store: store?.type || process.env.DATA_STORE || 'json',
    issues,
    warnings: configurationWarnings,
    timestamp: new Date().toISOString()
  };
}

function readinessHttpStatus(readiness) {
  return readiness?.ready === true ? 200 : 503;
}

module.exports = {
  buildHealth,
  buildReadiness,
  readinessHttpStatus,
  resolveApplicationVersion
};
'@

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText(
    $healthServicePath,
    $healthServiceContent,
    $utf8NoBom
)

Write-Step "Ensuring test:sprint757 exists without adding a BOM"

$package = Get-Content `
    -LiteralPath $packagePath `
    -Raw |
    ConvertFrom-Json

$testCommand = `
    'node tests/sprint757-trusted-release-registry-deployment-admission-control.test.js'

if (
    $null -eq $package.scripts.PSObject.Properties['test:sprint757']
) {
    $package.scripts |
        Add-Member `
            -NotePropertyName 'test:sprint757' `
            -NotePropertyValue $testCommand
} else {
    $package.scripts.'test:sprint757' = $testCommand
}

$packageJson = $package |
    ConvertTo-Json -Depth 100

[System.IO.File]::WriteAllText(
    $packagePath,
    $packageJson,
    $utf8NoBom
)

Write-Step "Verifying package.json encoding and syntax"

$packageBytes = [System.IO.File]::ReadAllBytes($packagePath)

if (
    $packageBytes.Length -ge 3 -and
    $packageBytes[0] -eq 0xEF -and
    $packageBytes[1] -eq 0xBB -and
    $packageBytes[2] -eq 0xBF
) {
    throw 'package.json still contains a UTF-8 BOM.'
}

if ($packageBytes[0] -ne 0x7B) {
    throw (
        'package.json does not begin with an opening brace. ' +
        ('First byte: 0x{0:X2}' -f $packageBytes[0])
    )
}

node -e `
    "const p=require('./package.json'); console.log({version:p.version,testSprint757:p.scripts['test:sprint757']});"

if ($LASTEXITCODE -ne 0) {
    throw 'Node.js could not parse package.json.'
}

Write-Step "Patch applied successfully"

Write-Host "Backup: $backupDirectory" -ForegroundColor Green
Write-Host "Next command: .\VERIFY-HEALTH-VERSION-FIX.ps1" `
    -ForegroundColor Yellow