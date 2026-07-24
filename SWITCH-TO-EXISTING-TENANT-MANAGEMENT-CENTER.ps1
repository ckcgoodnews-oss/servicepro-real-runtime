param(
  [string]$RepoRoot = "I:\REPO\servicepro-cumulative",
  [switch]$KeepExtractedSprintPackage
)

$ErrorActionPreference = "Stop"
Set-Location $RepoRoot

Write-Host "Switching from the temporary Sprint TMC1 overlay to the existing Tenant Management Center..." -ForegroundColor Cyan

$backup = Get-ChildItem -Path $RepoRoot -Directory -Filter ".sprint-tmc1-backup-*" |
  Sort-Object Name -Descending |
  Select-Object -First 1

if (-not $backup) {
  throw "No .sprint-tmc1-backup-* directory was found. The original pre-overlay files cannot be restored automatically."
}

$requiredBackupFiles = @(
  "router.js",
  "PlatformAdminWorkspace.tsx",
  "platform-admin.css"
)

foreach ($name in $requiredBackupFiles) {
  $path = Join-Path $backup.FullName $name
  if (-not (Test-Path $path)) {
    throw "The selected backup is incomplete. Missing: $path"
  }
}

Copy-Item (Join-Path $backup.FullName "router.js") `
  (Join-Path $RepoRoot "apps\api\src\router.js") -Force

Copy-Item (Join-Path $backup.FullName "PlatformAdminWorkspace.tsx") `
  (Join-Path $RepoRoot "apps\web\src\components\PlatformAdminWorkspace.tsx") -Force

Copy-Item (Join-Path $backup.FullName "platform-admin.css") `
  (Join-Path $RepoRoot "apps\web\src\app\platform-admin.css") -Force

$temporaryOverlayFiles = @(
  "apps\api\src\routes\platformTenantDashboard.js",
  "tests\platform-tenant-dashboard.test.js"
)

foreach ($relativePath in $temporaryOverlayFiles) {
  $path = Join-Path $RepoRoot $relativePath
  if (Test-Path $path) {
    Remove-Item $path -Force
    Write-Host "Removed temporary overlay: $relativePath"
  }
}

if (-not $KeepExtractedSprintPackage) {
  $extracted = Join-Path $RepoRoot "servicepro-sprint1-tenant-dashboard"
  if (Test-Path $extracted) {
    Remove-Item $extracted -Recurse -Force
    Write-Host "Removed extracted temporary sprint package."
  }
}

$existingImplementationFiles = @(
  "apps\api\src\repositories\tenantManagementRepository.js",
  "apps\api\src\routes\tenantManagement.js",
  "apps\web\src\app\(workspace)\platform-admin\page.tsx",
  "packages\database\postgres\777_tenant_management_center.sql",
  "scripts\APPLY-TENANT-MANAGEMENT-CENTER.ps1",
  "scripts\VERIFY-TENANT-MANAGEMENT-CENTER.ps1",
  "tests\tenant-management-center.test.js"
)

$missing = @()
foreach ($relativePath in $existingImplementationFiles) {
  if (-not (Test-Path (Join-Path $RepoRoot $relativePath))) {
    $missing += $relativePath
  }
}

if ($missing.Count -gt 0) {
  Write-Host ""
  Write-Host "The temporary overlay was removed, but the existing Tenant Management Center is incomplete:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "  MISSING: $_" -ForegroundColor Yellow }
  throw "Existing Tenant Management Center files are incomplete."
}

Write-Host ""
Write-Host "Running the existing Tenant Management Center APPLY script..." -ForegroundColor Cyan
& (Join-Path $RepoRoot "scripts\APPLY-TENANT-MANAGEMENT-CENTER.ps1")
if ($LASTEXITCODE -ne 0) {
  throw "Existing Tenant Management Center APPLY script failed."
}

Write-Host ""
Write-Host "Running the existing Tenant Management Center VERIFY script..." -ForegroundColor Cyan
& (Join-Path $RepoRoot "scripts\VERIFY-TENANT-MANAGEMENT-CENTER.ps1")
if ($LASTEXITCODE -ne 0) {
  throw "Existing Tenant Management Center VERIFY script failed."
}

Write-Host ""
Write-Host "Switch complete. The repository now uses the existing Tenant Management Center implementation." -ForegroundColor Green
Write-Host "Restored from backup: $($backup.FullName)"
Write-Host ""
git status --short
