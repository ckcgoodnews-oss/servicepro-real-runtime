[CmdletBinding()]
param(
    [string]$RepositoryPath = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path -LiteralPath $RepositoryPath).Path

$requiredFiles = @(
    'scripts\lib\release-drift-detector.js',
    'scripts\check-production-release-drift.js',
    'tests\sprint758-production-release-drift-detection.test.js',
    'docs\sprint758-production-release-drift-detection.md'
)

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $repoRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath)) {
        throw "MISSING: $relativePath"
    }

    Write-Host "PASS file: $relativePath"
}

$package = Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw |
    ConvertFrom-Json

if (
    $package.scripts.'release:drift-check' -ne
    'node scripts/check-production-release-drift.js'
) {
    throw 'package.json is missing the correct release:drift-check command.'
}

if (
    $package.scripts.'test:sprint758' -ne
    'node tests/sprint758-production-release-drift-detection.test.js'
) {
    throw 'package.json is missing the correct test:sprint758 command.'
}

Push-Location $repoRoot
try {
    & npm run test:sprint758
    if ($LASTEXITCODE -ne 0) {
        throw 'Sprint 758 tests failed.'
    }

    & git diff --check
    if ($LASTEXITCODE -ne 0) {
        throw 'git diff --check failed.'
    }
}
finally {
    Pop-Location
}

Write-Host ''
Write-Host 'SPRINT 758 VERIFICATION PASSED'
