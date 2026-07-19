[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"
Set-Location $RepoPath

$required = @(
    "scripts\lib\production-readiness-engine.js",
    "scripts\lib\security-hardening-engine.js",
    "scripts\lib\production-readiness-store.js",
    "scripts\evaluate-production-readiness.js",
    "scripts\evaluate-production-security.js",
    "config\production\production-readiness-policy.json",
    "config\production\production-security-policy.json",
    "tests\sprint771-production-readiness-certification.test.js",
    "tests\sprint772-production-security-hardening.test.js",
    "tests\phase70-production-readiness-hardening.integration.test.js",
    "apps\api\src\repositories\productionReadinessRepository.js",
    "apps\api\src\services\productionReadinessService.js",
    "apps\api\src\controllers\productionReadinessController.js",
    "apps\api\src\routes\productionReadiness.js",
    "migrations\postgres\771_production_readiness_hardening.sql",
    "docs\phase70-production-readiness-hardening.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required Phase 70 file: $file"
    }
}

npm run test:sprint771
if ($LASTEXITCODE -ne 0) { throw "Sprint 771 tests failed." }

npm run test:sprint772
if ($LASTEXITCODE -ne 0) { throw "Sprint 772 tests failed." }

npm run test:phase70
if ($LASTEXITCODE -ne 0) { throw "Phase 70 integration tests failed." }

node scripts/evaluate-production-readiness.js --allow-not-ready
if ($LASTEXITCODE -ne 0) { throw "Readiness evaluation failed." }

node scripts/evaluate-production-security.js --allow-findings
if ($LASTEXITCODE -ne 0) { throw "Security evaluation failed." }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed." }

Write-Host ""
Write-Host "PHASE 70 VERIFY PASSED" -ForegroundColor Green
git status --short
