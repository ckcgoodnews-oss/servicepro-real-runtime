# Local and Live Testing Loop

ServicePro now has two testing tracks that can be used during every sprint.

## Local test environment

Open two terminals from the repository root:

1. Run `npm run test-env:api` to start the seeded API at `http://localhost:10001`.
2. Run `npm run test-env:web` to start the website at `http://localhost:3000`.

Sign in with the documented demo owner account, then run `npm run test-env:smoke` in a third terminal. The smoke test verifies `/`, `/login`, `/system-status`, API health, CORS, readiness, and the data-store readiness contract.

Use the local environment for fast interaction while building. Local changes appear without waiting for GitHub or Render.

## Live Render environment

Each push to `main` starts the full GitHub CI workflow. Render watches `main` and deploys the API and website only after the GitHub checks pass.

Expected live URLs:

- Website: `https://servicepro-web-alpha-ckcgoodnews.onrender.com`
- API: `https://servicepro-api-alpha-ckcgoodnews.onrender.com`
- System Status: `https://servicepro-web-alpha-ckcgoodnews.onrender.com/system-status`

After Render finishes, run the **Online alpha smoke** workflow in GitHub Actions or run `scripts/smoke-deployed-app.js` with `SMOKE_WEB_URL`, `SMOKE_API_URL`, `SMOKE_TIMEOUT_MS=90000`, and `SMOKE_EXPECTED_VERSION=8.0.0-alpha.1`.

The live smoke test deliberately fails when Render is still serving an old commit.

## Safe promotion rule

A sprint is ready for live testing when local tests and the production build pass. A live release environment is accepted only when GitHub CI is green, Render reports both services and PostgreSQL as healthy, `/system-status` passes, and the authenticated PostgreSQL smoke test succeeds.
