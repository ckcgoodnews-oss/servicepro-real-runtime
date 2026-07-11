# ServicePro Cumulative Sprint Build

This repository was assembled in numerical order from the supplied Sprint 1 through Sprint 151 archives.

## Build identity

- Package: `servicepro-real-runtime`
- Version: `1.65.0`
- Included Sprints: 1-165
- Runtime entry point: `apps/api/src/server.js`
- Database migrations: `packages/database/postgres`

## Installation and validation

```powershell
npm install
npm test
npm run migrations:check
```

`npm test` runs every retained test file across the cumulative Sprint history. The repository intentionally excludes `node_modules`; install dependencies before validation.

## Assembly note

The original Sprint archives contain replacement versions of shared files as well as additive feature files. The final shared files therefore match the latest supplied Sprint state. Historical `SPRINT*_REQUIRED_WIRING.md` documents remain included for integration auditing.
