# Phase 47: Online Application Delivery

## Sprint 731 — Render online alpha foundation

- Added a root Render Blueprint that provisions the Node API and authenticated Next.js website together.
- Pinned both alpha services to the reviewed Phase 46 release branch and disabled automatic deployments.
- Added generated API signing secrets and explicit frontend/API origin wiring without committing credentials.
- Added an online deployment guide with a one-click Blueprint link, health and login checks, troubleshooting, and promotion gates.
- Documented that the first online alpha uses temporary seeded JSON data and must not receive real customer or confidential information.
- Added an executable deployment-contract validator, production-mode API health smoke test, and regression test.

The next delivery step is to create the Render Blueprint from the connected GitHub repository, validate the public alpha, then certify persistent PostgreSQL before production promotion.

## Sprint 732 — In-app deployment diagnostics

- Added a System Status workspace for browser-to-API connectivity, health, readiness, latency, runtime, version, storage, and authentication checks.
- Added safe copyable diagnostics that exclude credentials and access tokens.
- Added prominent temporary-data guidance when the alpha API reports JSON storage.
- Added System Status entry points in the workspace sidebar and Settings.

## Sprint 733 — Production readiness enforcement

- Replaced the always-ready API response with real configuration and data-store checks.
- Added PostgreSQL query and JSON read verification without exposing connection details.
- Changed `/readyz` to return HTTP 503 when the deployment should not receive traffic.
- Pointed the Render API health gate at `/readyz` and expanded the local deployment smoke test to verify both liveness and readiness.

## Sprint 734 — Deployed application smoke testing

- Added a reusable smoke runner for website routes, API health, readiness, and CORS.
- Added optional credential-backed login, dashboard, and logout verification without logging secrets or tokens.
- Added a manual GitHub Actions entry point for testing any approved website and API URL.
- Added isolated mock-server regression coverage for the complete deployed application flow.

## Sprint 735 — Render cold-start verification

- Added a configurable request window to the deployed application smoke runner.
- Set the GitHub online smoke workflow to allow 90 seconds for free-tier Render cold starts.
- Kept the shorter local default so local failures still return quickly.
- Added release-version and data-store readiness contract checks so an older Render deployment is reported clearly.
- Set the alpha API's reported release version independently from package installation metadata.

## Sprint 736 — Continuous local and live testing

- Added the release branch to the full GitHub CI push gate.
- Configured both Render services to deploy only after GitHub checks pass.
- Formalized separate local API, local website, and local smoke-test commands.
- Added a local-versus-live testing guide with acceptance criteria and safe data guidance.
- Aligned the API runtime and website package metadata on release `8.0.0-alpha.1`.

## Sprint 737 — Fresh-deployment authentication recovery

- Removed the legacy customer/job-only JSON initializer from API startup.
- Initialized the authoritative repository datastore before the API accepts traffic.
- Expanded the production-mode API smoke test to authenticate the documented demo owner against a brand-new temporary datastore.
- Added regression coverage for the Render login failure and updated online troubleshooting guidance.

## Sprint 738 — Supabase company provisioning

- Added a guarded provisioning command for a dedicated Supabase project per company.
- Made migration execution reusable and resumable while retaining per-file migration tracking.
- Added a generated single-file Supabase bootstrap containing all 679 PostgreSQL migrations.
- Added configurable company tenant, owner, and service seeding without logging passwords.
- Documented the one-database-per-API deployment model and the Render environment required for persistent Supabase storage.

## Sprint 739 — PostgreSQL deployment certification gate

- Added a PostgreSQL 16 workflow to every release-branch push.
- Certified the complete migration manifest before database installation.
- Added owner and service seeding to the clean-database pipeline.
- Added production-mode PostgreSQL API readiness, login, and authenticated-dashboard smoke coverage.
- Replaced invalid expression-based table constraints with PostgreSQL-compatible unique indexes and added actionable migration failure annotations.
