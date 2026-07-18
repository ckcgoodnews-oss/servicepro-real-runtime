[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"

Set-Location $RepoPath

$required = @(
    "scripts\lib\release-integrity-monitor.js",
    "scripts\lib\release-integrity-quarantine.js",
    "scripts\enforce-release-quarantine.js",
    "tests\sprint760-release-integrity-quarantine-response.test.js",
    "docs\sprint760-release-integrity-quarantine-response.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json

if ($package.scripts.'test:sprint760' -ne 'node tests/sprint760-release-integrity-quarantine-response.test.js') {
    throw "Missing or incorrect test:sprint760 package command."
}

if ($package.scripts.'release:quarantine-check' -ne 'node scripts/enforce-release-quarantine.js') {
    throw "Missing or incorrect release:quarantine-check package command."
}

npm run test:sprint760
if ($LASTEXITCODE -ne 0) {
    throw "Sprint 760 tests failed."
}

node scripts/enforce-release-quarantine.js --allow-quarantined
if ($LASTEXITCODE -ne 0) {
    throw "Release quarantine evaluation failed."
}

git diff --check
if ($LASTEXITCODE -ne 0) {
    throw "git diff --check failed."
}

Write-Host ""
Write-Host "SPRINT 760 VERIFY PASSED" -ForegroundColor Green
git status --short
