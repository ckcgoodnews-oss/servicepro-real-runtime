# Sprint 759 — Continuous Release Integrity Monitoring

## Purpose

Sprint 759 continuously evaluates the production-release drift evidence created by Sprint 758 and turns it into an operational health signal.

## Health states

- `healthy`: the current deployment remains aligned;
- `degraded`: required runtime or trusted evidence is incomplete;
- `critical`: confirmed release drift exists;
- `recovered`: a previously non-aligned deployment is aligned again.

## Incident behavior

The monitor creates a deterministic incident key from the drift state and release fingerprints.

Repeated evaluations of the same unresolved condition are marked as duplicate incidents and suppressed. A transition from any non-aligned state to `aligned` is reported as recovery.

## Evidence files

Default output files:

- `release-evidence/continuous-release-integrity-report.json`
- `release-evidence/continuous-release-integrity-state.json`

The underlying Sprint 758 report remains:

- `release-evidence/production-release-drift-report.json`

## Commands

```powershell
npm run test:sprint759
npm run release:integrity-monitor -- --allow-degraded
```

Strict monitoring exits with code `2` for `degraded` or `critical`.

## Production scheduling

Run the command from the deployment scheduler, cron service, Render job, or operational monitor at an interval appropriate to the release process.

Do not commit generated release-evidence reports that contain environment-specific deployment metadata.
