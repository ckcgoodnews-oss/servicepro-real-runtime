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
