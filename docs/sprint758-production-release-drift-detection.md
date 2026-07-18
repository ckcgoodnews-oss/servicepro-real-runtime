# Sprint 758 — Production Release Drift Detection

## Objective

Sprint 758 detects differences between the trusted release admitted by Sprint 757 and the release that is actually running in an environment.

The control is fail-closed. A deployment is considered aligned only when all required evidence fields exist and match.

## Required evidence

The detector compares:

- `releaseId`
- `version`
- `sourceCommit`
- `artifactDigest`
- `environment`

Trusted evidence is loaded in this order:

1. `release-evidence/trusted-release-entry.json`
2. `release-evidence/trusted-release-registry.json`

The paths may be overridden with:

- `TRUSTED_RELEASE_ENTRY_PATH`
- `TRUSTED_RELEASE_REGISTRY_PATH`
- `RELEASE_EVIDENCE_DIR`
- `RELEASE_DRIFT_REPORT_PATH`

Actual runtime evidence may be supplied by `RUNTIME_RELEASE_EVIDENCE_PATH`, or with environment variables:

- `RELEASE_ID` or `SERVICEPRO_RELEASE_ID`
- `APP_VERSION` or `SERVICEPRO_VERSION`
- `GIT_COMMIT_SHA`, `RENDER_GIT_COMMIT`, `COMMIT_SHA`, or `SOURCE_COMMIT`
- `RELEASE_ARTIFACT_DIGEST`, `ARTIFACT_DIGEST`, or `RELEASE_BUNDLE_DIGEST`
- `DEPLOYMENT_ENVIRONMENT`, `RENDER_SERVICE_NAME`, or `NODE_ENV`

## Status values

- `aligned`: all required fields exist and match.
- `drifted`: expected and actual values exist but one or more values differ.
- `unknown`: trusted evidence exists, but runtime evidence is incomplete.
- `evidence_missing`: trusted evidence is absent or incomplete.

Every state except `aligned` returns a nonzero process exit code.

## Commands

```powershell
npm run test:sprint758
npm run release:drift-check
```

The drift report is written to:

```text
release-evidence/production-release-drift-report.json
```

The report contains fingerprints and comparison results. It does not write raw secrets, credentials, signing keys, or tokens.

## Production example

```powershell
$env:RELEASE_ID = 'release-2026-07-18'
$env:APP_VERSION = '8.0.0-alpha.1'
$env:GIT_COMMIT_SHA = '<deployed commit SHA>'
$env:RELEASE_ARTIFACT_DIGEST = '<trusted artifact digest>'
$env:DEPLOYMENT_ENVIRONMENT = 'production'

npm run release:drift-check
```

## Rollback

Sprint 758 adds standalone scripts, tests, documentation, and package commands. To remove it before commit:

```powershell
git restore package.json
Remove-Item scripts\check-production-release-drift.js -Force
Remove-Item scripts\lib\release-drift-detector.js -Force
Remove-Item tests\sprint758-production-release-drift-detection.test.js -Force
Remove-Item docs\sprint758-production-release-drift-detection.md -Force
```

After a commit, use `git revert <sprint-758-commit-sha>` rather than rewriting branch history.
