# ServicePro Online Alpha

The repository now includes a Render Blueprint for an isolated online alpha. It creates two services from the current release branch:

- `servicepro-api-alpha-ckcgoodnews`: the Node API with generated signing secrets
- `servicepro-web-alpha-ckcgoodnews`: the authenticated Next.js website

## Start the deployment

1. Open the [ServicePro Render Blueprint](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fckcgoodnews-oss%2Fservicepro-real-runtime%2Ftree%2Fcodex%2Fsprint-716-frontend-foundation).
2. Sign in to Render with GitHub and authorize access to `ckcgoodnews-oss/servicepro-real-runtime` if prompted.
3. Review the two free web services and choose **Deploy Blueprint**.
4. Wait for both services to report **Live**. Free services can take several minutes to build and can spin down when idle.
5. Open `https://servicepro-api-alpha-ckcgoodnews.onrender.com/readyz`. It should return JSON with `"ready": true` and passing configuration, runtime, and data-store checks.
6. Open `https://servicepro-web-alpha-ckcgoodnews.onrender.com/login` and sign in with the demo owner account documented in `WEBSITE_TESTING.md`.
7. Open `/system-status` from the workspace sidebar and confirm every readiness check passes.

The Blueprint is pinned to `codex/sprint-716-frontend-foundation`. Each push runs the full GitHub CI workflow, and Render deploys the commit only after those checks pass. See `LIVE_TESTING.md` for the local and live test loop.

Before an online deploy, run `npm run deploy:validate:online` and `npm run deploy:smoke:api` from the repository root. The API smoke test starts with an empty temporary datastore and verifies health, readiness, and the documented demo owner login, which catches missing seed data before Render deployment.

After deployment, set `SMOKE_WEB_URL` and `SMOKE_API_URL`, then run `node scripts/smoke-deployed-app.js`. Add `SMOKE_EMAIL`, `SMOKE_PASSWORD`, and `SMOKE_REQUIRE_AUTH=true` to include login, dashboard, and logout checks. The runner never prints credentials or access tokens. The same check can be started manually from GitHub Actions with the **Online alpha smoke** workflow.

For the temporary alpha, choose `tenant_demo` and expected store `json`. For a provisioned company deployment, enter that company's tenant key and choose expected store `postgres`; the smoke rejects temporary storage and cross-tenant authentication.

Each manual workflow run now retains a sanitized `deployment-certification.json` artifact for 30 days. Use it as deployment evidence; it records the tested tenant, datastore, version, endpoints, authentication status, checks, and UTC completion time without credentials or tokens.

Free Render services can take longer to answer their first request after being idle. Set `SMOKE_TIMEOUT_MS=90000` for a 90-second cold-start window; subsequent checks should complete much faster.

If the smoke runner reports a missing `/system-status` route, an old API version, or a stale readiness contract after CI has passed, open each Render service and choose **Manual Deploy → Deploy latest commit**.

## Alpha data warning

This first online connection uses the seeded JSON store in Render's temporary filesystem. It is appropriate for functional testing, and it makes the demo login available on a fresh deploy. Data entered during testing can disappear after a restart or redeploy. Do not enter real customer, payment, employee, or confidential data.

Before a production launch, complete the PostgreSQL adapter certification, provision persistent storage, rotate/remove all demo credentials, configure a custom domain, and merge the release through `main` with passing CI. See `SUPABASE_DEPLOYMENT.md` for the dedicated-project-per-company setup and complete migration bundle.

## Troubleshooting

- A `CORS` browser error means the website origin and API `CORS_ALLOWED_ORIGINS` do not match. The committed service names are wired together already; update both values if Render requires a different service name.
- A website build can only use the API URL present in `NEXT_PUBLIC_API_BASE_URL` at build time. After changing it, rebuild the web service.
- A `401` response for the documented demo account means the API is stale or its seed initialization failed. Confirm CI includes the fresh-deployment login test, deploy the latest passing commit to the API service, and retry in a new browser session.
- Check the API `/healthz` and `/readyz` endpoints before diagnosing the website. Health confirms the process is running; readiness confirms it can safely receive application traffic.

## Promotion path

After the online alpha is accepted:

1. Open and review a pull request into `main`.
2. Require the full CI workflow to pass.
3. Replace branch-pinned alpha services with production services that deploy only after checks pass.
4. Move the API to certified persistent PostgreSQL storage.
5. Set the production website origin in `CORS_ALLOWED_ORIGINS`, then smoke-test login and every primary workspace route.

## Company deployment manifest

Before deploying a new company's Render services, run `npm run company:manifest` with the company's `.env.company.local`. Review the generated report under `reports/company-deployments` and confirm that the tenant ID, Supabase project reference, API URL, web URL, expected version, and PostgreSQL store are correct.

## Sprint 743: apply a downloaded sprint ZIP automatically

After downloading a toolkit into `I:\REPO`, apply it without manually opening the ZIP:

```powershell
Set-Location I:\REPO\servicepro-cumulative

.\scripts\apply-downloaded-sprint.ps1 `
  -Sprint 743 `
  -DownloadPath 'I:\REPO' `
  -RepoPath 'I:\REPO\servicepro-cumulative'
```

The installer extracts the archive under `I:\REPO\servicepro-toolkit-staging`, invokes the sprint APPLY script, and then runs its VERIFY script. It refuses ambiguous ZIP matches and preserves the extracted toolkit for audit and rollback.

## Sprint 744 company onboarding gate

Run `npm run company:provision:plan` before provisioning a new company. Review `reports/company-provisioning/<tenant>.json`, configure the listed Render variables securely, and only then run `npm run company:provision` with `CONFIRM_COMPANY_PROVISIONING=YES`.

## Sprint 745 local web application testing

Run the API and Next.js web application on separate ports and verify both endpoints with:

```powershell
npm run web:test:local
```

Defaults are API port `3000` and web port `3001`. The command checks `/health`, checks the web `/login` page, opens the browser, writes logs under `logs/`, and stops the temporary processes after the test. Use `-KeepRunning` directly with `scripts/test-local-webapp.ps1` to leave both servers running for manual testing.

## Sprint 746 authenticated local web application test

Run the API and Next.js application together with `npm run web:test:local`. The harness uses `/healthz` and `/readyz` and starts Next.js directly so npm does not misinterpret the port as a project directory.

For the complete login and protected-dashboard test, set `LOCAL_TEST_EMAIL`, `LOCAL_TEST_PASSWORD`, and optionally `LOCAL_TEST_TENANT_ID`, then run `npm run web:test:local:auth`. Credentials are read only from the process environment and are not written to reports or source control.

## Sprint 748 — Production Release Certification

Production certification is available through:

```powershell
$env:NODE_ENV = 'production'
$env:ALLOW_LOCAL_PRODUCTION_BUILD = 'true'
$env:NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000'
npm run release:certify
```

Certification is intentionally blocked when `git status --porcelain
--untracked-files=all` returns source changes. Commit or discard all changes
before certification.

A successful run executes the Sprint 744–748 tests, verifies the Render
deployment configuration, executes the root production build, validates the
required `.next` artifacts and `reports/build/release-manifest.json`, and writes:

- `reports/release/production-certification.json`
- `reports/release/production-certification.md`

The GitHub Actions workflow `.github/workflows/production-release-certification.yml`
runs the same command for manual dispatches and configured release branches. It
uploads the release manifest and certification evidence as a retained workflow
artifact.


## Sprint 749 — Release Evidence Hardening

Sprint 749 normalizes production certification summaries to portable ASCII,
eliminating Windows console mojibake such as `â€”`.

Run the hardening step after production certification:

```powershell
npm run release:certify
npm run release:evidence:harden
```

Generated evidence:

- `reports/release/production-certification.json`
- `reports/release/production-certification.md`
- `reports/release/production-certification.sha256`
- `reports/release/release-evidence-manifest.json`

The hardening step validates certification status, source cleanliness, commit
format, artifact records, summary portability, and SHA-256 evidence integrity.
The GitHub Actions workflow retains hardened evidence for 180 days.


## Sprint 750 — Release Evidence Verification and Reproducibility

Sprint 750 independently verifies the release evidence created by Sprints 748
and 749.

Run the complete reproducibility pipeline:

```powershell
npm run release:reproduce
```

The command executes:

1. `npm run release:certify`
2. `npm run release:evidence:harden`
3. `npm run release:evidence:verify`

Verification confirms:

- the repository is clean;
- certification and build manifests match the current commit;
- certification status is passed;
- checksum records match current files;
- evidence-manifest sizes and SHA-256 values are correct;
- certified artifacts match build-manifest artifacts;
- the certification summary is portable ASCII.

Generated verification evidence:

- `reports/release/release-evidence-verification.json`
- `reports/release/release-reproducibility-report.md`


## Sprint 751 — Release Provenance and Attestation

Sprint 751 adds provenance and attestation records to the release evidence
pipeline.

Run the full release proof pipeline:

```powershell
npm run release:prove
```

The command executes the complete reproducibility pipeline and then creates:

- `reports/release/release-provenance.json`
- `reports/release/release-attestation.json`
- `reports/release/release-attestation.md`

The provenance record captures repository identity, branch, commit SHA, builder
environment, CI run metadata, application identity, Next.js build identity,
source materials, and SHA-256 digests.

The attestation uses an in-toto-style statement structure and records the
provenance digest as its subject.


## Sprint 752 — Release Attestation Verification and Policy Gate

Sprint 752 independently verifies release provenance and attestation integrity,
then evaluates release-promotion policy.

Run the complete gate:

```powershell
npm run release:gate
```

The gate validates:

- clean repository state;
- approved branch patterns;
- passed release verification;
- passed release attestation;
- exact current commit matching;
- provenance SHA-256 integrity;
- required attestation materials;
- material size and checksum integrity;
- application identity;
- CI execution when `RELEASE_REQUIRE_CI=true`.

Generated evidence:

- `reports/release/release-policy-gate.json`
- `reports/release/release-policy-gate.md`

Local execution defaults to `RELEASE_REQUIRE_CI=false`. The GitHub Actions
workflow requires CI provenance.


## Sprint 753 — Release Promotion Manifest and Deployment Authorization

Sprint 753 converts a passed release policy gate into an explicit promotion
manifest and deployment authorization record.

Run the complete promotion pipeline:

```powershell
npm run release:promote
```

The command runs the full release gate and then creates:

- `reports/release/release-promotion-manifest.json`
- `reports/release/deployment-authorization.json`
- `reports/release/deployment-authorization.md`

Authorization validates:

- passed policy-gate result;
- promotion eligibility;
- exact commit consistency;
- provenance digest integrity;
- attestation integrity;
- application identity;
- CI provenance when required;
- authorization actor presence when required.

The GitHub Actions workflow uses a protected GitHub Environment so deployment
approval rules can be applied before authorization is generated.


## Sprint 754 — Deployment Execution Receipt, Post-Deployment Verification, and Rollback Readiness

Sprint 754 records deployment execution, validates the deployed endpoint, and
produces rollback-readiness evidence.

Run:

```powershell
npm run release:deploy-verify
```

Required environment variable:

```powershell
$env:DEPLOYMENT_URL = 'https://your-production-url.example'
```

Generated evidence:

- `reports/release/deployment-execution-receipt.json`
- `reports/release/post-deployment-verification.json`
- `reports/release/rollback-readiness.json`
- `reports/release/deployment-execution-summary.md`

The verification step validates deployment authorization, release promotion
integrity, exact commit matching, endpoint reachability, expected HTTP status,
response hashing, and rollback instructions.


## Sprint 754 — Deployment Environment Inventory and Immutable Release Bundle

Sprint 754 captures the actual runtime environment values used for release
authorization and seals all release evidence into a checksum-protected bundle.

Run:

```powershell
npm run release:seal
```

Generated outputs:

- `reports/release/deployment-environment-inventory.json`
- `reports/release/immutable-release-bundle-manifest.json`
- `reports/release/immutable-release-bundle.md`
- `reports/release/immutable-bundle/`

Non-secret values are written exactly as used. Secret values are never exposed;
they are represented as `[REDACTED]` with a short SHA-256 fingerprint.


## Sprint 756 — Cryptographic Release Signing and Verification

Sprint 756 adds an RSA-SHA256 detached signature for the immutable release
bundle manifest, signer identity and public-key fingerprint evidence, and
independent signature verification.

Commands:

```powershell
npm run release:sign
npm run release:verify-signature
npm run release:trusted
```

