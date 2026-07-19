# Phase 67 Operations Runbook

## Generate a local command-center report

```powershell
npm run release:command-center-report
```

## Run command-center tests

```powershell
npm run test:sprint766
npm run test:phase67
```

## API endpoints

- `GET /api/release-command-center/environments`
- `GET /api/release-command-center/timeline`
- `GET /api/release-command-center/audit`
- `POST /api/release-command-center/dashboard/build`
- `POST /api/release-command-center/audit`

## Operational rule

The command center is an observability and governance plane. It must not directly bypass promotion, rollout, quarantine, or rollback controls.
