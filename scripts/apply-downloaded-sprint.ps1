[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateRange(1, 9999)]
  [int]$Sprint,

  [string]$DownloadPath = 'I:\REPO',
  [string]$RepoPath = 'I:\REPO\servicepro-cumulative',
  [string]$ExtractionRoot = 'I:\REPO\servicepro-toolkit-staging',
  [switch]$SkipVerify,
  [switch]$ForceExtract
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-ToolkitZip {
  param([int]$SprintNumber, [string]$Folder)

  if (-not (Test-Path -LiteralPath $Folder -PathType Container)) {
    throw "ZIP download folder not found: $Folder"
  }

  $pattern = "servicepro-sprint$SprintNumber-*.zip"
  $matches = @(Get-ChildItem -LiteralPath $Folder -Filter $pattern -File |
      Sort-Object LastWriteTimeUtc -Descending)

  if ($matches.Count -eq 0) {
    throw "No toolkit ZIP matching '$pattern' was found in $Folder"
  }

  if ($matches.Count -gt 1) {
    $names = ($matches | ForEach-Object Name) -join ', '
    throw "Multiple Sprint $SprintNumber ZIPs were found. Keep only the intended archive or specify a clean download folder. Matches: $names"
  }

  return $matches[0]
}

function Resolve-ToolkitRoot {
  param([string]$Folder, [int]$SprintNumber)

  $applyName = "APPLY-SPRINT-$SprintNumber.ps1"
  $applyScripts = @(Get-ChildItem -LiteralPath $Folder -Filter $applyName -File -Recurse)
  if ($applyScripts.Count -ne 1) {
    throw "Expected exactly one $applyName after extraction; found $($applyScripts.Count)."
  }

  return $applyScripts[0].Directory.FullName
}

if (-not (Test-Path -LiteralPath (Join-Path $RepoPath '.git'))) {
  throw "Git repository not found at $RepoPath"
}

$zip = Resolve-ToolkitZip -SprintNumber $Sprint -Folder $DownloadPath
$destination = Join-Path $ExtractionRoot ("sprint-{0}" -f $Sprint)

if (Test-Path -LiteralPath $destination) {
  if (-not $ForceExtract) {
    throw "Extraction folder already exists: $destination. Use -ForceExtract to replace it."
  }
  Remove-Item -LiteralPath $destination -Recurse -Force
}

New-Item -ItemType Directory -Path $destination -Force | Out-Null
Write-Host "Extracting $($zip.FullName)" -ForegroundColor Cyan
Expand-Archive -LiteralPath $zip.FullName -DestinationPath $destination -Force

$toolkitRoot = Resolve-ToolkitRoot -Folder $destination -SprintNumber $Sprint
$applyScript = Join-Path $toolkitRoot ("APPLY-SPRINT-{0}.ps1" -f $Sprint)
$verifyScript = Join-Path $toolkitRoot ("VERIFY-SPRINT-{0}.ps1" -f $Sprint)

Write-Host "Applying Sprint $Sprint to $RepoPath" -ForegroundColor Cyan
& $applyScript -RepoPath $RepoPath
if ($LASTEXITCODE -ne 0) {
  throw "Sprint $Sprint APPLY script failed with exit code $LASTEXITCODE."
}

if (-not $SkipVerify) {
  if (-not (Test-Path -LiteralPath $verifyScript -PathType Leaf)) {
    throw "Verification script not found: $verifyScript"
  }
  Write-Host "Verifying Sprint $Sprint" -ForegroundColor Cyan
  & $verifyScript -RepoPath $RepoPath
  if ($LASTEXITCODE -ne 0) {
    throw "Sprint $Sprint VERIFY script failed with exit code $LASTEXITCODE."
  }
}

Write-Host "Sprint $Sprint applied successfully." -ForegroundColor Green
Write-Host "Toolkit retained at: $toolkitRoot" -ForegroundColor DarkGray
Write-Host "Review changes with: git -C `"$RepoPath`" status --short" -ForegroundColor Yellow
