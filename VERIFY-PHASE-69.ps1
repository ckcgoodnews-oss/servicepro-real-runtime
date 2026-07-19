[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"

Set-Location $RepoPath

$required = @(
    "scripts\lib\release-policy-simulation-engine.js",
    "scripts\lib\cd-control-optimizer.js",
    "scripts\lib\release-policy-store.js",
    "scripts\simulate-release-policy.js",
    "scripts\optimize-cd-controls.js",
    "config\release\delivery-control-policy.json",
    "tests\sprint769-release-policy-simulation.test.js",
    "tests\sprint770-continuous-delivery-control-optimization.test.js",
    "tests\phase69-release-policy-simulation-control-optimization.integration.test.js",
    "apps\api\src\repositories\releasePolicyOptimizationRepository.js",
    "apps\api\src\services\releasePolicyOptimizationService.js",
    "apps\api\src\controllers\releasePolicyOptimizationController.js",
    "apps\api\src\routes\releasePolicyOptimization.js",
    "migrations\postgres\769_release_policy_simulation_control_optimization.sql",
    "docs\phase69-release-policy-simulation-control-optimization.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required Phase 69 file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json

$expected = @{
    "release:policy-simulate" = "node scripts/simulate-release-policy.js"
    "release:controls-optimize" = "node scripts/optimize-cd-controls.js"
    "test:sprint769" = "node tests/sprint769-release-policy-simulation.test.js"
    "test:sprint770" = "node tests/sprint770-continuous-delivery-control-optimization.test.js"
    "test:phase69" = "node tests/phase69-release-policy-simulation-control-optimization.integration.test.js"
}

foreach ($entry in $expected.GetEnumerator()) {
    if ($package.scripts.($entry.Key) -ne $entry.Value) {
        throw "Missing or incorrect package command: $($entry.Key)"
    }
}

npm run test:sprint769
if ($LASTEXITCODE -ne 0) { throw "Sprint 769 tests failed." }

npm run test:sprint770
if ($LASTEXITCODE -ne 0) { throw "Sprint 770 tests failed." }

npm run test:phase69
if ($LASTEXITCODE -ne 0) { throw "Phase 69 integration tests failed." }

node scripts/simulate-release-policy.js
if ($LASTEXITCODE -ne 0) { throw "Policy simulation failed." }

node scripts/optimize-cd-controls.js
if ($LASTEXITCODE -ne 0) { throw "Control optimization failed." }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed." }

Write-Host ""
Write-Host "PHASE 69 VERIFY PASSED" -ForegroundColor Green
git status --short
