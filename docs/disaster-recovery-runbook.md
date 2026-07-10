# Disaster Recovery Runbook

## Severity levels

```text
SEV1: Production unavailable or data corruption suspected.
SEV2: Major feature unavailable.
SEV3: Partial degradation.
```

## SEV1 recovery steps

1. Freeze deploys.
2. Preserve logs, audit events, and latest database snapshot.
3. Identify latest verified backup.
4. Restore backup to staging first.
5. Validate application boot and data integrity.
6. Promote restored database or re-point application.
7. Run post-restore checks.
8. Document root cause.

## Post-restore checks

```powershell
npm run config:check
npm run migrations:check
npm test
Invoke-RestMethod https://your-domain/healthz
Invoke-RestMethod https://your-domain/readyz
```

## Data integrity check

```powershell
POST /api/v1/integrity/run
GET  /api/v1/integrity
```
