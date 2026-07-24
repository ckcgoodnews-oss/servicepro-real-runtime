[CmdletBinding()]
param(
  [string]$RepoPath = 'I:\REPO\servicepro-cumulative'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Push-Location $RepoPath
try {
  node --test tests/tenant-management-center.test.js tests/workspace-context-switching.test.js tests/platform-owner-provisioning.test.js
  git diff --check
  Write-Host 'Tenant Management Center verification passed.' -ForegroundColor Green
}
finally {
  Pop-Location
}
