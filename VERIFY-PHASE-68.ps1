[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"

Set-Location $RepoPath

$required = @(
    "scripts\lib\release-risk-engine.js",
    "scripts\lib\deployment-optimization-engine.js",
    "scripts\lib\release-intelligence-store.js",
    "scripts\evaluate-release-risk.js",
    "scripts\analyze-deployment-performance.js",
    "config\release\release-risk-policy.json",
    "config\release\deployment-optimization-policy.json",
    "tests\sprint767-predictive-release-risk-intelligence.test.js",
    "tests\sprint768-deployment-performance-optimization.test.js",
    "tests\phase68-release-intelligence-optimization.integration.test.js",
    "apps\api\src\repositories\releaseIntelligenceRepository.js",
    "apps\api\src\services\releaseIntelligenceService.js",
    "apps\api\src\controllers\releaseIntelligenceController.js",
    "apps\api\src\routes\releaseIntelligence.js",
    "migrations\postgres\767_release_intelligence_optimization.sql",
    "docs\phase68-release-intelligence-optimization.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required Phase 68 file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json

$expected = @{
    "release:risk-evaluate" = "node scripts/evaluate-release-risk.js"
    "release:performance-analyze" = "node scripts/analyze-deployment-performance.js"
    "test:sprint767" = "node tests/sprint767-predictive-release-risk-intelligence.test.js"
    "test:sprint768" = "node tests/sprint768-deployment-performance-optimization.test.js"
    "test:phase68" = "node tests/phase68-release-intelligence-optimization.integration.test.js"
}

foreach ($entry in $expected.GetEnumerator()) {
    if ($package.scripts.($entry.Key) -ne $entry.Value) {
        throw "Missing or incorrect package command: $($entry.Key)"
    }
}

npm run test:sprint767
if ($LASTEXITCODE -ne 0) { throw "Sprint 767 tests failed." }

npm run test:sprint768
if ($LASTEXITCODE -ne 0) { throw "Sprint 768 tests failed." }

npm run test:phase68
if ($LASTEXITCODE -ne 0) { throw "Phase 68 integration tests failed." }

node scripts/evaluate-release-risk.js --allow-blocked
if ($LASTEXITCODE -ne 0) { throw "Release risk evaluation failed." }

node scripts/analyze-deployment-performance.js
if ($LASTEXITCODE -ne 0) { throw "Deployment performance analysis failed." }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed." }

Write-Host ""
Write-Host "PHASE 68 VERIFY PASSED" -ForegroundColor Green
git status --short
