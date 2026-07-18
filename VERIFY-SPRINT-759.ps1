[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"
Set-Location $RepoPath

$required = @(
    "scripts\lib\release-drift-detector.js",
    "scripts\lib\release-integrity-monitor.js",
    "scripts\monitor-release-integrity.js",
    "tests\sprint759-continuous-release-integrity-monitoring.test.js",
    "docs\sprint759-continuous-release-integrity-monitoring.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json
if ($package.scripts.'test:sprint759' -ne 'node tests/sprint759-continuous-release-integrity-monitoring.test.js') {
    throw "Missing or incorrect test:sprint759 package command."
}
if ($package.scripts.'release:integrity-monitor' -ne 'node scripts/monitor-release-integrity.js') {
    throw "Missing or incorrect release:integrity-monitor package command."
}

npm run test:sprint759
if ($LASTEXITCODE -ne 0) { throw "Sprint 759 tests failed." }

node scripts/monitor-release-integrity.js --allow-degraded
if ($LASTEXITCODE -ne 0) { throw "Release integrity monitor failed." }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed." }

Write-Host ""
Write-Host "SPRINT 759 VERIFY PASSED" -ForegroundColor Green
git status --short

