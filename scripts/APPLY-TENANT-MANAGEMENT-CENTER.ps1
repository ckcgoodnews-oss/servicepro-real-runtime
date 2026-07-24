[CmdletBinding()]
param(
  [string]$RepoPath = 'I:\REPO\servicepro-cumulative'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath (Join-Path $RepoPath 'package.json'))) {
  throw "Repo path not found: $RepoPath"
}

Push-Location $RepoPath
try {
  Write-Host 'Applying database migrations...' -ForegroundColor Cyan
  npm run migrate

  Write-Host 'Running Tenant Management Center verification...' -ForegroundColor Cyan
  node --test tests/tenant-management-center.test.js

  Write-Host 'Tenant Management Center applied and verified.' -ForegroundColor Green
}
finally {
  Pop-Location
}
