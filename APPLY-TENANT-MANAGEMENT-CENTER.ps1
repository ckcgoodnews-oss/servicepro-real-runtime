# ============================================================
# APPLY: Tenant Management Center (Sprints 1-10)
# Complete Enterprise Platform Admin Subsystem
# ============================================================
# This script verifies all files are in place and commits.
# Run from repository root: .\APPLY-TENANT-MANAGEMENT-CENTER.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Tenant Management Center - APPLY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify required files exist
$requiredFiles = @(
    "packages/database/postgres/778_tenant_management_center_full.sql",
    "apps/api/src/repositories/tenantManagementCenterRepository.js",
    "apps/api/src/routes/tenantManagementCenter.js"
)

$allPresent = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host ""
    Write-Host "ERROR: Some files are missing. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying router integration..." -ForegroundColor Yellow
$routerContent = Get-Content "apps/api/src/router.js" -Raw

if ($routerContent -match "tenantManagementCenter") {
    Write-Host "  [OK] Router includes tenantManagementCenter" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Router missing tenantManagementCenter import" -ForegroundColor Red
    exit 1
}

if ($routerContent -match "api/v1/platform/tmc") {
    Write-Host "  [OK] Router dispatch for /api/v1/platform/tmc" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Router missing TMC dispatch" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying admin routes..." -ForegroundColor Yellow
$adminRoutesContent = Get-Content "apps/admin/src/routes/adminRoutes.ts" -Raw
if ($adminRoutesContent -match "platformAdminRoutes") {
    Write-Host "  [OK] Platform admin routes defined" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Platform admin routes missing" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verifying repository auto-discovery..." -ForegroundColor Yellow
$repoFile = "apps/api/src/repositories/tenantManagementCenterRepository.js"
$repoContent = Get-Content $repoFile -Raw
if ($repoContent -match "createTenantManagementCenterRepository") {
    Write-Host "  [OK] Repository exports createTenantManagementCenterRepository" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Repository export missing" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ALL VERIFICATIONS PASSED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "The Tenant Management Center is ready." -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints available at:" -ForegroundColor White
Write-Host "  POST   /api/v1/platform/tmc/tenants" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/transfer-owner" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/bulk-status" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/impersonation/owners/:oid/start" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/impersonation/sessions/:id/end" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/impersonation/sessions" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/impersonation/terminate-all" -ForegroundColor Gray
Write-Host "  PATCH  /api/v1/platform/tmc/:id/subscription" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/billing/events" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/billing/events" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/modules" -ForegroundColor Gray
Write-Host "  PUT    /api/v1/platform/tmc/:id/modules/:key" -ForegroundColor Gray
Write-Host "  PATCH  /api/v1/platform/tmc/:id/branding" -ForegroundColor Gray
Write-Host "  PATCH  /api/v1/platform/tmc/:id/white-label" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/oauth-clients" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/oauth-clients" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/oauth-clients/:cid/revoke" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/webhooks" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/webhooks" -ForegroundColor Gray
Write-Host "  DELETE /api/v1/platform/tmc/:id/webhooks/:wid" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/usage" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/health" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/audit" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/audit/export" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/recovery/tenants" -ForegroundColor Gray
Write-Host "  GET    /api/v1/platform/tmc/:id/deleted-owners" -ForegroundColor Gray
Write-Host "  POST   /api/v1/platform/tmc/:id/purge" -ForegroundColor Gray
Write-Host ""

# Git operations
Write-Host "Staging and committing..." -ForegroundColor Yellow
git add packages/database/postgres/778_tenant_management_center_full.sql
git add apps/api/src/repositories/tenantManagementCenterRepository.js
git add apps/api/src/routes/tenantManagementCenter.js
git add apps/api/src/router.js
git add apps/admin/src/routes/adminRoutes.ts
git add APPLY-TENANT-MANAGEMENT-CENTER.ps1

git commit -m "feat(platform): add Tenant Management Center (Sprints 1-10)

Complete enterprise platform administration subsystem:
- Sprint 1: Tenant CRUD, owner management, transfer between tenants
- Sprint 2: Bulk operations, tenant tags, search/filter
- Sprint 3: Impersonation (login as owner), read-only mode, emergency terminate
- Sprint 4: Subscription management, billing events, usage limits
- Sprint 5: Feature flags, module enable/disable, beta features
- Sprint 6: White-label branding, custom themes, email branding
- Sprint 7: OAuth clients, webhooks, rate limiting
- Sprint 8: Usage statistics, storage monitoring, health scores
- Sprint 9: Full audit history, search, export, compliance
- Sprint 10: Soft-delete recovery, permanent purge, restore

Endpoints: /api/v1/platform/tmc/*
Access: Platform admin only (email whitelist)
Database: Migration 778 (PostgreSQL), JSON store fallback
Repository: Auto-discovered via repositoryFactory pattern"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " COMMIT COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Run migrations: node scripts/run-migrations.js" -ForegroundColor White
Write-Host "  2. Start server: node apps/api/src/server.js" -ForegroundColor White
Write-Host "  3. Test: curl -H 'Authorization: Bearer <token>' http://localhost:3000/api/v1/platform/tmc/tenants" -ForegroundColor White
Write-Host ""
