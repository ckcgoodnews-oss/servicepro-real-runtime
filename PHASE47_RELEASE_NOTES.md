# Phase 47: Online Application Delivery

## Sprint 731 — Render online alpha foundation

- Added a root Render Blueprint that provisions the Node API and authenticated Next.js website together.
- Pinned both alpha services to the reviewed Phase 46 release branch and disabled automatic deployments.
- Added generated API signing secrets and explicit frontend/API origin wiring without committing credentials.
- Added an online deployment guide with a one-click Blueprint link, health and login checks, troubleshooting, and promotion gates.
- Documented that the first online alpha uses temporary seeded JSON data and must not receive real customer or confidential information.
- Added an executable deployment-contract validator, production-mode API health smoke test, and regression test.

The next delivery step is to create the Render Blueprint from the connected GitHub repository, validate the public alpha, then certify persistent PostgreSQL before production promotion.
