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

Free Render services can take longer to answer their first request after being idle. Set `SMOKE_TIMEOUT_MS=90000` for a 90-second cold-start window; subsequent checks should complete much faster.

If the smoke runner reports a missing `/system-status` route, an old API version, or a stale readiness contract after CI has passed, open each Render service and choose **Manual Deploy → Deploy latest commit**.

## Alpha data warning

This first online connection uses the seeded JSON store in Render's temporary filesystem. It is appropriate for functional testing, and it makes the demo login available on a fresh deploy. Data entered during testing can disappear after a restart or redeploy. Do not enter real customer, payment, employee, or confidential data.

Before a production launch, complete the PostgreSQL adapter certification, provision persistent storage, rotate/remove all demo credentials, configure a custom domain, and merge the release through `main` with passing CI.

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
