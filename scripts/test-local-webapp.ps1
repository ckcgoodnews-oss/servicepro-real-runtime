[CmdletBinding()]
param(
    [string]$RepoPath = "",
    [int]$ApiPort = 3000,
    [int]$WebPort = 3001,
    [switch]$SkipStart,
    [switch]$KeepRunning,
    [switch]$RequireAuth
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($RepoPath)) {
    $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path

    if ([string]::IsNullOrWhiteSpace($scriptDirectory)) {
        throw 'Unable to determine the script directory.'
    }

    $RepoPath = (Resolve-Path (Join-Path $scriptDirectory '..')).Path
}
Set-Location $RepoPath

$apiUrl = "http://localhost:$ApiPort"
$webUrl = "http://localhost:$WebPort"
$apiLog = Join-Path $RepoPath 'logs\local-api-test.log'
$webLog = Join-Path $RepoPath 'logs\local-web-test.log'
New-Item -ItemType Directory -Force (Split-Path $apiLog) | Out-Null

function Wait-Http {
    param([string]$Url, [int]$TimeoutSeconds = 120)
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $r }
        } catch { Start-Sleep -Seconds 2 }
    } while ((Get-Date) -lt $deadline)
    throw "Timed out waiting for $Url"
}

$started = @()
try {
    if (-not $SkipStart) {
        $apiCommand = "set PORT=$ApiPort&& set CORS_ALLOWED_ORIGINS=$webUrl&& npm run dev > `"$apiLog`" 2>&1"
        $api = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d','/s','/c',$apiCommand -WorkingDirectory $RepoPath -PassThru
        $started += $api

        $nextBin = Join-Path $RepoPath 'node_modules\next\dist\bin\next'
        if (-not (Test-Path $nextBin)) { $nextBin = Join-Path $RepoPath 'apps\web\node_modules\next\dist\bin\next' }
        if (-not (Test-Path $nextBin)) { throw 'Next.js executable was not found. Run npm install first.' }
        $webCommand = "set NEXT_PUBLIC_API_URL=$apiUrl&& node `"$nextBin`" dev `"$RepoPath\apps\web`" -p $WebPort > `"$webLog`" 2>&1"
        $web = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d','/s','/c',$webCommand -WorkingDirectory $RepoPath -PassThru
        $started += $web
    }

    Wait-Http -Url "$apiUrl/healthz" | Out-Null
    Wait-Http -Url "$apiUrl/readyz" | Out-Null
    $login = Wait-Http -Url "$webUrl/login"
    if ($login.Content -notmatch '(?i)login|sign in|email') { throw 'Web login page loaded but expected login content was not found.' }

    $mustAuthenticate = $RequireAuth -or ($env:LOCAL_TEST_REQUIRE_AUTH -eq 'true')
    if ($mustAuthenticate) {
        if (-not $env:LOCAL_TEST_EMAIL -or -not $env:LOCAL_TEST_PASSWORD) {
            throw 'LOCAL_TEST_EMAIL and LOCAL_TEST_PASSWORD are required for authenticated local testing.'
        }
        $env:SMOKE_WEB_URL = $webUrl
        $env:SMOKE_API_URL = $apiUrl
        $env:SMOKE_TENANT_ID = if ($env:LOCAL_TEST_TENANT_ID) { $env:LOCAL_TEST_TENANT_ID } else { 'tenant_demo' }
        $env:SMOKE_EMAIL = $env:LOCAL_TEST_EMAIL
        $env:SMOKE_PASSWORD = $env:LOCAL_TEST_PASSWORD
        $env:SMOKE_REQUIRE_AUTH = 'true'
        node scripts/smoke-deployed-app.js
        if ($LASTEXITCODE -ne 0) { throw 'Authenticated local end-to-end smoke test failed.' }
    }

    Write-Host ''
    Write-Host 'LOCAL WEB APP TEST PASSED' -ForegroundColor Green
    Write-Host "API health: $apiUrl/healthz"
    Write-Host "API ready:  $apiUrl/readyz"
    Write-Host "Web login:  $webUrl/login"
    Write-Host "API log:    $apiLog"
    Write-Host "Web log:    $webLog"
    if (-not $mustAuthenticate) { Write-Host 'Set LOCAL_TEST_EMAIL, LOCAL_TEST_PASSWORD, and use -RequireAuth for the full login test.' }
    Start-Process "$webUrl/login"

    if ($KeepRunning) { Write-Host 'Servers remain running.'; $started = @() }
}
finally {
    foreach ($p in $started) { if ($p -and -not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } }
}


