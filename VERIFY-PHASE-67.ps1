[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoPath = "I:\REPO\servicepro-cumulative"

Set-Location $RepoPath

$required = @(
    "scripts\lib\release-command-center-analytics.js",
    "scripts\lib\release-command-center-timeline.js",
    "scripts\lib\release-command-center-audit.js",
    "scripts\generate-release-command-center-report.js",
    "config\release\command-center-config.json",
    "tests\sprint766-enterprise-release-command-center.test.js",
    "tests\phase67-enterprise-release-command-center.integration.test.js",
    "apps\api\src\repositories\releaseCommandCenterRepository.js",
    "apps\api\src\services\releaseCommandCenterService.js",
    "apps\api\src\controllers\releaseCommandCenterController.js",
    "apps\api\src\routes\releaseCommandCenter.js",
    "apps\web\views\release-command-center\index.ejs",
    "apps\web\public\release-command-center\app.js",
    "apps\web\public\release-command-center\styles.css",
    "migrations\postgres\766_enterprise_release_command_center.sql",
    "docs\phase67-enterprise-release-command-center.md"
)

foreach ($file in $required) {
    if (-not (Test-Path -LiteralPath $file)) {
        throw "Missing required Phase 67 file: $file"
    }
}

$package = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json

$expected = @{
    "release:command-center-report" = "node scripts/generate-release-command-center-report.js"
    "test:sprint766" = "node tests/sprint766-enterprise-release-command-center.test.js"
    "test:phase67" = "node tests/phase67-enterprise-release-command-center.integration.test.js"
}

foreach ($entry in $expected.GetEnumerator()) {
    if ($package.scripts.($entry.Key) -ne $entry.Value) {
        throw "Missing or incorrect package command: $($entry.Key)"
    }
}

npm run test:sprint766
if ($LASTEXITCODE -ne 0) { throw "Sprint 766 tests failed." }

npm run test:phase67
if ($LASTEXITCODE -ne 0) { throw "Phase 67 integration tests failed." }

node scripts/generate-release-command-center-report.js
if ($LASTEXITCODE -ne 0) { throw "Command-center report generation failed." }

git diff --check
if ($LASTEXITCODE -ne 0) { throw "git diff --check failed." }

Write-Host ""
Write-Host "PHASE 67 VERIFY PASSED" -ForegroundColor Green
git status --short
