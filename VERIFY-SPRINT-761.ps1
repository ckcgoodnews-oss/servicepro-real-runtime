[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"

Set-Location $RepoPath

$required = @(
    "scripts\lib\release-integrity-quarantine.js",
    "scripts\lib\governed-quarantine-override.js",
    "scripts\check-release-quarantine-override.js",
    "tests\sprint761-governed-quarantine-override.test.js",
    "docs\sprint761-governed-quarantine-override.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json

if ($package.scripts.'test:sprint761' -ne 'node tests/sprint761-governed-quarantine-override.test.js') {
    throw "Missing or incorrect test:sprint761 package command."
}

if ($package.scripts.'release:override-check' -ne 'node scripts/check-release-quarantine-override.js') {
    throw "Missing or incorrect release:override-check package command."
}

npm run test:sprint761
if ($LASTEXITCODE -ne 0) {
    throw "Sprint 761 tests failed."
}

node scripts/check-release-quarantine-override.js --allow-denied
if ($LASTEXITCODE -ne 0) {
    throw "Governed quarantine override evaluation failed."
}

git diff --check
if ($LASTEXITCODE -ne 0) {
    throw "git diff --check failed."
}

Write-Host ""
Write-Host "SPRINT 761 VERIFY PASSED" -ForegroundColor Green
git status --short
