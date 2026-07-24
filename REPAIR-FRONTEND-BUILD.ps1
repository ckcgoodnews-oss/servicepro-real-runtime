[CmdletBinding()]
param(
    [string]$RepositoryRoot = "I:\REPO\servicepro-cumulative",
    [switch]$SkipRootInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step {
    param([Parameter(Mandatory)][string]$Message)

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory)][string]$Command,
        [Parameter(Mandatory)][string[]]$Arguments,
        [string]$WorkingDirectory
    )

    $originalLocation = Get-Location

    try {
        if ($WorkingDirectory) {
            Set-Location $WorkingDirectory
        }

        Write-Host ("> {0} {1}" -f $Command, ($Arguments -join " ")) -ForegroundColor DarkGray
        & $Command @Arguments

        if ($LASTEXITCODE -ne 0) {
            throw "$Command failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Set-Location $originalLocation
    }
}

function Remove-DirectorySafely {
    param([Parameter(Mandatory)][string]$Path)

    if (Test-Path -LiteralPath $Path) {
        Write-Host "Removing $Path"
        Remove-Item -LiteralPath $Path -Recurse -Force
    }
}

function Add-GitIgnoreRule {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Rule
    )

    $content = if (Test-Path -LiteralPath $Path) {
        Get-Content -LiteralPath $Path -Raw
    }
    else {
        ""
    }

    $lines = @($content -split "`r?`n")

    if ($lines -notcontains $Rule) {
        if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
            $content += [Environment]::NewLine
        }

        $content += $Rule + [Environment]::NewLine

        [System.IO.File]::WriteAllText(
            $Path,
            $content,
            [System.Text.UTF8Encoding]::new($false)
        )
    }
}

$RepositoryRoot = [System.IO.Path]::GetFullPath($RepositoryRoot)
$WebRoot = Join-Path $RepositoryRoot "apps\web"
$WebPackageJson = Join-Path $WebRoot "package.json"
$WebLockFile = Join-Path $WebRoot "package-lock.json"
$SchedulePagePath = Join-Path $WebRoot "src\app\(workspace)\schedule\page.tsx"
$GitIgnorePath = Join-Path $RepositoryRoot ".gitignore"

Set-Location $RepositoryRoot

if (-not (Test-Path -LiteralPath (Join-Path $RepositoryRoot ".git"))) {
    throw "No Git repository was found at $RepositoryRoot."
}

if (-not (Test-Path -LiteralPath $WebPackageJson)) {
    throw "The web package was not found at $WebPackageJson."
}

Write-Step "Confirming current branch"
Invoke-Checked git @("branch", "--show-current") $RepositoryRoot

Write-Step "Checking Node and npm"
Invoke-Checked node @("--version") $RepositoryRoot
Invoke-Checked npm @("--version") $RepositoryRoot



Write-Step "Writing static-export-safe schedule page"

$schedulePage = @'
'use client';

import dynamic from 'next/dynamic';

const WorkOrderWorkspace = dynamic(
  () =>
    import('@/components/WorkOrderWorkspace').then(
      (module) => module.WorkOrderWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <section className="panel" aria-busy="true" aria-live="polite">
        <p>Loading the service calendar…</p>
      </section>
    ),
  },
);

export default function SchedulePage() {
  return (
    <div className="dashboard-content work-orders-page">
      <div className="dashboard-intro">
        <div>
          <p className="eyebrow">
            <span aria-hidden="true" /> Service calendar
          </p>
          <h1>Schedule</h1>
          <p>
            Coordinate appointments, technician assignments, and service
            windows across every trade.
          </p>
        </div>
      </div>

      <WorkOrderWorkspace initialView="calendar" />
    </div>
  );
}
'@

[System.IO.File]::WriteAllText(
    $SchedulePagePath,
    $schedulePage,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Step "Updating .gitignore"

$ignoreRules = @(
    ".pnpm-store/",
    "**/.next/",
    "**/out/",
    "**/*.tsbuildinfo",
    "*.backup-*",
    "test-results*.txt",
    "wrangler-deploy-error.txt"
)

foreach ($rule in $ignoreRules) {
    Add-GitIgnoreRule -Path $GitIgnorePath -Rule $rule
}

Write-Step "Removing generated outputs from the Git index"

$trackedGeneratedPaths = @(
    ".pnpm-store",
    "apps/web/.next",
    "apps/web/out",
    "apps/web/tsconfig.tsbuildinfo"
)

foreach ($path in $trackedGeneratedPaths) {
    $tracked = & git -C $RepositoryRoot ls-files -- $path

    if ($LASTEXITCODE -ne 0) {
        throw "git ls-files failed while checking $path."
    }

    if ($tracked) {
        Invoke-Checked git @(
            "-C",
            $RepositoryRoot,
            "rm",
            "-r",
            "--cached",
            "--ignore-unmatch",
            "--",
            $path
        ) $RepositoryRoot
    }
}

Write-Step "Removing local build caches"

Remove-DirectorySafely (Join-Path $RepositoryRoot ".pnpm-store")
Remove-DirectorySafely (Join-Path $WebRoot ".next")
Remove-DirectorySafely (Join-Path $WebRoot "out")

$generatedFiles = @(
    (Join-Path $WebRoot "tsconfig.tsbuildinfo"),
    (Join-Path $RepositoryRoot "test-results-after-repair.txt"),
    (Join-Path $RepositoryRoot "wrangler-deploy-error.txt")
)

foreach ($file in $generatedFiles) {
    if (Test-Path -LiteralPath $file) {
        Remove-Item -LiteralPath $file -Force
    }
}

Write-Step "Clearing environment values that can suppress development dependencies"

Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue
Remove-Item Env:NPM_CONFIG_PRODUCTION -ErrorAction SilentlyContinue
Remove-Item Env:NPM_CONFIG_OMIT -ErrorAction SilentlyContinue
Remove-Item Env:NODE_PATH -ErrorAction SilentlyContinue
Remove-Item Env:NEXT_OUTPUT -ErrorAction SilentlyContinue

# NODE_ENV must not be set to production before npm ci. TypeScript and the React
# declaration packages are devDependencies and are required for this build.

if (-not $SkipRootInstall) {
    Write-Step "Installing the root dependency tree, including development dependencies"

    if (Test-Path -LiteralPath (Join-Path $RepositoryRoot "package-lock.json")) {
        Invoke-Checked npm @("ci", "--include=dev") $RepositoryRoot
    }
    else {
        Invoke-Checked npm @("install", "--include=dev") $RepositoryRoot
    }
}
else {
    Write-Step "Skipping root dependency installation"
}

Write-Step "Installing the web dependency tree, including TypeScript declarations"

if (Test-Path -LiteralPath $WebLockFile) {
    Invoke-Checked npm @("ci", "--include=dev") $WebRoot
}
else {
    Invoke-Checked npm @("install", "--include=dev") $WebRoot
}

Write-Step "Verifying the web framework and compiler dependency tree"
Invoke-Checked npm @(
    "ls",
    "next",
    "react",
    "react-dom",
    "typescript",
    "@types/react",
    "@types/react-dom",
    "--depth=0"
) $WebRoot

Write-Step "Running TypeScript validation"
Invoke-Checked npm @("run", "typecheck") $WebRoot

Write-Step "Running clean static export"

# Set production mode only after both dependency trees have been installed.
$env:NODE_ENV = "production"
Invoke-Checked npm @("run", "build:pages") $WebRoot

Write-Step "Running Tenant Management Center regression tests"
Invoke-Checked node @(
    "--test",
    (Join-Path $RepositoryRoot "tests\tenant-management-center.test.js")
) $RepositoryRoot

Write-Step "Checking migration inventory"
Invoke-Checked npm @("run", "migrations:check") $RepositoryRoot

Write-Step "Frontend build repair completed"
Write-Host ""
Write-Host "PASS: dependencies, typecheck, static export, tests, and migrations all passed." -ForegroundColor Green
Write-Host ""
Write-Host "Review the intentional changes with:"
Write-Host "  git status --short"
Write-Host "  git diff -- .gitignore"
Write-Host '  git diff -- "apps/web/src/app/(workspace)/schedule/page.tsx"'
