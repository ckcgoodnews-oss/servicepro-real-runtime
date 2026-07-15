# Testing the ServicePro Website Locally

Use two PowerShell windows from the repository root.

## 1. Start the API

```powershell
Set-Location "I:\REPO\servicepro-cumulative"
$env:DATA_STORE = "json"
$env:DATA_FILE = "./data/servicepro-runtime.json"
$env:PORT = "10001"
$env:JWT_SECRET = "local-development-secret-change-before-production"
node scripts/seed-auth.js
node apps/api/src/server.js
```

Leave that window running. The health check should respond at `http://localhost:10001/healthz`.

Port `10001` is intentionally used for local JSON testing so it does not collide with a locally running production API on port `10000`.

## 2. Start the website

```powershell
Set-Location "I:\REPO\servicepro-cumulative\apps\web"
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

Open `http://localhost:3000`. Use the local demonstration account only:

- Tenant: `tenant_demo`
- Email: `owner@example.com`
- Password: `ChangeMe123!`

## 3. What to verify

- The public homepage loads and switches between light and dark themes.
- Login redirects to the protected operations dashboard.
- Dashboard KPIs load without a red error message.
- `Ctrl+K` opens search and `Escape` closes it.
- The profile menu and sign-out action work.
- At a narrow browser width, the menu button opens and closes the navigation drawer.

The seed credentials are for local JSON development only. Never enable or reuse them in production.
