[CmdletBinding()]
param(
    [string]$ProjectRoot = 'I:\REPO\servicepro-cumulative',
    [switch]$RunFullTests
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory)]
        [string]$Description,

        [Parameter(Mandatory)]
        [scriptblock]$Command
    )

    Write-Host ''
    Write-Host "==> $Description" -ForegroundColor Cyan

    & $Command

    if ($LASTEXITCODE -ne 0) {
        throw "$Description failed with exit code $LASTEXITCODE."
    }
}

if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    throw "Project directory does not exist: $ProjectRoot"
}

Set-Location -LiteralPath $ProjectRoot

Write-Host ''
Write-Host 'ServicePro health/version verification' -ForegroundColor Green
Write-Host "Project: $ProjectRoot"

Write-Host ''
Write-Host '==> Checking package.json BOM' -ForegroundColor Cyan

$packageBytes = [System.IO.File]::ReadAllBytes(
    (Join-Path $ProjectRoot 'package.json')
)

$firstBytes = $packageBytes[0..(
    [Math]::Min(7, $packageBytes.Length - 1)
)] |
    ForEach-Object {
        '{0:X2}' -f $_
    }

Write-Host "First bytes: $($firstBytes -join ' ')"

if (
    $packageBytes.Length -ge 3 -and
    $packageBytes[0] -eq 0xEF -and
    $packageBytes[1] -eq 0xBB -and
    $packageBytes[2] -eq 0xBF
) {
    throw 'FAIL: package.json contains a UTF-8 BOM.'
}

if ($packageBytes[0] -ne 0x7B) {
    throw (
        'FAIL: package.json does not begin with 0x7B. ' +
        ('Actual first byte: 0x{0:X2}' -f $packageBytes[0])
    )
}

Write-Host 'PASS: package.json is UTF-8 without BOM.' `
    -ForegroundColor Green

Invoke-CheckedCommand `
    -Description 'Parsing package.json with Node.js' `
    -Command {
        node -e @'
const pkg = require('./package.json');

if (pkg.version !== '8.0.0-alpha.1') {
  throw new Error(`Unexpected package version: ${pkg.version}`);
}

const expected =
  'node tests/sprint757-trusted-release-registry-deployment-admission-control.test.js';

if (pkg.scripts['test:sprint757'] !== expected) {
  throw new Error(
    `Unexpected test:sprint757 command: ${pkg.scripts['test:sprint757']}`
  );
}

console.log('package.json validation passed.');
'@
    }

Write-Host ''
Write-Host '==> Testing package.json version fallback' `
    -ForegroundColor Cyan

Remove-Item Env:APP_VERSION -ErrorAction SilentlyContinue

node -e @'
const health = require('./apps/api/src/services/healthService');
const result = health.buildHealth();

console.log(JSON.stringify(result, null, 2));

if (result.version !== '8.0.0-alpha.1') {
  throw new Error(`Unexpected health version: ${result.version}`);
}

if (result.versionSource !== 'package.json') {
  throw new Error(`Unexpected version source: ${result.versionSource}`);
}

if (result.environmentVersion !== null) {
  throw new Error('environmentVersion should be null.');
}
'@

if ($LASTEXITCODE -ne 0) {
    throw 'package.json version fallback validation failed.'
}

Write-Host 'PASS: package.json version fallback works.' `
    -ForegroundColor Green

Write-Host ''
Write-Host '==> Testing APP_VERSION override' -ForegroundColor Cyan

$env:APP_VERSION = '7.0.0'

try {
    node -e @'
const health = require('./apps/api/src/services/healthService');
const result = health.buildHealth();

console.log(JSON.stringify(result, null, 2));

if (result.version !== '7.0.0') {
  throw new Error(`Unexpected overridden version: ${result.version}`);
}

if (result.versionSource !== 'APP_VERSION') {
  throw new Error(`Unexpected version source: ${result.versionSource}`);
}

if (result.packageVersion !== '8.0.0-alpha.1') {
  throw new Error(`Unexpected package version: ${result.packageVersion}`);
}
'@

    if ($LASTEXITCODE -ne 0) {
        throw 'APP_VERSION override validation failed.'
    }
} finally {
    Remove-Item Env:APP_VERSION -ErrorAction SilentlyContinue
}

Write-Host 'PASS: APP_VERSION override works.' `
    -ForegroundColor Green

Invoke-CheckedCommand `
    -Description 'Running Sprint 733 readiness test' `
    -Command {
        node .\tests\sprint733-real-readiness.test.js
    }

Invoke-CheckedCommand `
    -Description 'Running Sprint 736 continuous testing test' `
    -Command {
        node .\tests\sprint736-continuous-testing.test.js
    }

Invoke-CheckedCommand `
    -Description 'Running Sprint 739 PostgreSQL certification gate test' `
    -Command {
        node .\tests\sprint739-postgres-certification-gate.test.js
    }

Invoke-CheckedCommand `
    -Description 'Running Sprint 742 company manifest test' `
    -Command {
        node .\tests\sprint742-company-deployment-manifest.test.js
    }

Invoke-CheckedCommand `
    -Description 'Running Sprint 745 local web application harness test' `
    -Command {
        node .\tests\sprint745-local-webapp-test-harness.test.js
    }

Invoke-CheckedCommand `
    -Description 'Running Sprint 747 root build orchestration test' `
    -Command {
        node .\tests\sprint747-root-build-orchestration.test.js
    }

Invoke-CheckedCommand `
    -Description 'Running Sprint 757 trusted release test' `
    -Command {
        npm run test:sprint757
    }

Invoke-CheckedCommand `
    -Description 'Checking migrations' `
    -Command {
        npm run migrations:check
    }

Invoke-CheckedCommand `
    -Description 'Verifying Render deployment configuration' `
    -Command {
        npm run build:render:verify
    }

if ($RunFullTests) {
    Invoke-CheckedCommand `
        -Description 'Running complete test suite' `
        -Command {
            npm test
        }
}

Write-Host ''
Write-Host 'ALL REQUESTED VERIFICATIONS PASSED.' `
    -ForegroundColor Green