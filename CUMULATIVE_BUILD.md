# ServicePro Cumulative Sprint Build

This repository was assembled in numerical order from the supplied Sprint 1 through Sprint 151 archives.

## Build identity

- Package: `servicepro-real-runtime`
- Version: `1.52.0`
- Included Sprints: 1-152
- Runtime entry point: `apps/api/src/server.js`
- Database migrations: `packages/database/postgres`

## Installation and validation

```powershell
npm install
npm test
npm run migrations:check
```

The repository intentionally excludes `node_modules`. Install dependencies before running runtime-backed historical tests.

## Assembly note

The original Sprint archives contain replacement versions of shared files as well as additive feature files. The final shared files therefore match the latest supplied Sprint state. Historical `SPRINT*_REQUIRED_WIRING.md` documents remain included for integration auditing.
