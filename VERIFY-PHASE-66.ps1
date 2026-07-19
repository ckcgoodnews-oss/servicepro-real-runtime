[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"

Set-Location $RepoPath

$required = @(
    "scripts\lib\progressive-rollout-engine.js",
    "scripts\lib\rollback-governance-engine.js",
    "scripts\lib\deployment-evidence-store.js",
    "scripts\create-progressive-rollout.js",
    "scripts\advance-progressive-rollout.js",
    "scripts\evaluate-automated-rollback.js",
    "config\release\rollout-policy.json",
    "config\release\rollback-policy.json",
    "tests\sprint764-progressive-rollout-orchestration.test.js",
    "tests\sprint765-automated-rollback-governance.test.js",
    "tests\phase66-enterprise-deployment-automation.integration.test.js",
    "migrations\postgres\764_enterprise_deployment_automation.sql",
    "docs\phase66-enterprise-deployment-automation.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required Phase 66 file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json

$expected = @{
    "release:rollout-create" = "node scripts/create-progressive-rollout.js"
    "release:rollout-advance" = "node scripts/advance-progressive-rollout.js"
    "release:rollback-evaluate" = "node scripts/evaluate-automated-rollback.js"
    "test:sprint764" = "node tests/sprint764-progressive-rollout-orchestration.test.js"
    "test:sprint765" = "node tests/sprint765-automated-rollback-governance.test.js"
    "test:phase66" = "node tests/phase66-enterprise-deployment-automation.integration.test.js"
}

foreach ($entry in $expected.GetEnumerator()) {
    if ($package.scripts.($entry.Key) -ne $entry.Value) {
        throw "Missing or incorrect package command: $($entry.Key)"
    }
}

npm run test:sprint764
if ($LASTEXITCODE -ne 0) { throw "Sprint 764 tests failed." }

npm run test:sprint765
if ($LASTEXITCODE -ne 0) { throw "Sprint 765 tests failed." }

npm run test:phase66
if ($LASTEXITCODE -ne 0) { throw "Phase 66 integration tests failed." }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed." }

Write-Host ""
Write-Host "PHASE 66 VERIFY PASSED" -ForegroundColor Green
git status --short
