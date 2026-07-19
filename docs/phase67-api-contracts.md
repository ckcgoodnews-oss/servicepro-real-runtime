# Phase 67 API Contracts

## Environment status

`GET /api/release-command-center/environments`

Returns current release, health, rollout state, and incident count by environment.

## Timeline

`GET /api/release-command-center/timeline?limit=100`

Returns authorization, promotion, rollout, rollback, and incident events ordered newest first.

## Audit explorer

`GET /api/release-command-center/audit`

Supported filters:

- actor
- action
- resourceType
- outcome
- limit

## Dashboard builder

`POST /api/release-command-center/dashboard/build`

Builds summary KPIs, environment status, and timeline data from supplied governed release records.
