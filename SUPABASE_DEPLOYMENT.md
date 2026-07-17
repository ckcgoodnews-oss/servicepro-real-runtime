# ServicePro on Supabase

ServicePro supports a dedicated Supabase PostgreSQL project for each company. In the current architecture, each company also needs its own API service (and normally its own website service) because an API process has one `DATABASE_URL`. A single API that dynamically routes companies to separate Supabase projects is not implemented.

The existing online alpha is not using Supabase yet. Its Render API currently has `DATA_STORE=json`, so its data is temporary.

## Create a company project

1. In the ServicePro Supabase organization, create a new project with a unique project name and a generated database password.
2. Keep the old project `ipdnxfvpcwdxqltqyeam` as test data; do not reuse it for a customer.
3. In the new project, choose **Connect** and copy either:
   - the direct connection string for migrations when the machine can reach Supabase over IPv6; or
   - the Session pooler connection string on port `5432` for an IPv4-only machine or persistent Render service.
4. Copy `.env.company.example` to `.env.company.local` and replace every placeholder. This local file is ignored by Git.
5. Run:

   ```powershell
   npm run migrations:check
   npm run supabase:provision
   ```

The provisioner applies all 679 migrations in order, records each one in `postgres_runtime_migrations`, removes demo-only rows, registers the company tenant, writes company settings, and creates the initial owner. It never prints the database password or owner password.

The release branch also runs the same migration set against a clean PostgreSQL 16 service in GitHub Actions. That gate seeds an owner and services, starts the production API with `DATA_STORE=postgres`, verifies `/readyz`, signs in, and loads the authenticated dashboard before a commit is accepted for company deployment.

Provisioning refuses a database that already has ServicePro migrations. This prevents accidentally overwriting the test project. For a reviewed retry of a partially provisioned new project, set `ALLOW_EXISTING_DATABASE=true` in the local company environment file.

## SQL Editor fallback

Run `npm run supabase:bundle` to regenerate `packages/database/supabase/servicepro-bootstrap.sql`. The committed bundle contains all 679 migrations and can be opened in the Supabase SQL Editor for a brand-new empty project.

The bundle is a one-time schema bootstrap. The recommended `supabase:provision` command is safer because it skips completed migrations and also creates the company tenant and owner without placing a plaintext owner password in SQL history.

## Connect the company application

Create or clone a dedicated Render API service for the company and configure:

```text
DATA_STORE=postgres
DATABASE_URL=<new company Supabase connection string>
DATABASE_SSL=true
DEFAULT_TENANT_ID=<same value as COMPANY_TENANT_ID>
JWT_SECRET=<new generated secret>
PORTAL_TOKEN_SECRET=<new generated secret>
CORS_ALLOWED_ORIGINS=<company website origin>
```

Point the company website's `NEXT_PUBLIC_API_BASE_URL` at that dedicated API service, deploy, then verify `/readyz`, login, dashboard data, and logout.

Run the production smoke with the company-specific tenant and require PostgreSQL explicitly:

```powershell
$env:SMOKE_WEB_URL='https://company.example.com'
$env:SMOKE_API_URL='https://api.company.example.com'
$env:SMOKE_TENANT_ID='company_tenant'
$env:SMOKE_EXPECTED_STORE='postgres'
$env:SMOKE_REQUIRE_AUTH='true'
$env:SMOKE_EMAIL='<company owner email>'
$env:SMOKE_PASSWORD='<company owner password>'
node scripts/smoke-deployed-app.js
```

The smoke fails if readiness reports temporary JSON storage or if authentication resolves to a different tenant. The GitHub **Online alpha smoke** workflow exposes the same tenant and datastore controls for an approved manual run.

To retain a sanitized certification report for release evidence, also set a report path:

```powershell
$env:SMOKE_REPORT_PATH='reports/online-smoke/deployment-certification.json'
node scripts/smoke-deployed-app.js
```

The JSON report contains the checked URLs, tenant key, datastore, deployed version, authentication status, completed checks, and UTC completion time. It never contains the owner email, password, access token, or refresh token. The GitHub **Online alpha smoke** workflow uploads the same report as a 30-day deployment certification artifact.

Never commit a Supabase database password, connection string, service-role key, JWT secret, or owner password. Rotate the initial owner password after first login and enable backups before entering customer data.

Supabase connection guidance: https://supabase.com/docs/guides/database/connecting-to-postgres

Supabase migration guidance: https://supabase.com/docs/guides/deployment/database-migrations

## Sprint 742: company deployment manifest

After provisioning a dedicated Supabase project, generate the company deployment record:

```powershell
$env:COMPANY_ENV_FILE = '.env.company.local'
npm run company:manifest
```

The default output is `reports/company-deployments/<tenant-id>.json`. It records the dedicated Supabase project reference, tenant identity, expected PostgreSQL store, deployment URLs, required Render variables, and smoke-test contract. It does not contain the database URL or owner password and is safe to retain as a deployment audit artifact.

## Sprint 744: prepare and execute company provisioning

Create `.env.company.local` from `.env.company.example`, replace every placeholder, and keep the file out of Git.

Generate a secret-safe plan without modifying the database:

```powershell
$env:COMPANY_ENV_FILE = '.env.company.local'
npm run company:provision:plan
```

After reviewing the generated JSON, explicitly authorize and execute provisioning:

```powershell
$env:COMPANY_ENV_FILE = '.env.company.local'
$env:CONFIRM_COMPANY_PROVISIONING = 'YES'
npm run company:provision
Remove-Item Env:CONFIRM_COMPANY_PROVISIONING
```

The plan records the dedicated Supabase project, ordered commands, Render-variable checklist, and security exclusions. It never stores database URLs or owner passwords.
