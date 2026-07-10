# Incident Runbook

## App unavailable

1. Check `/healthz`.
2. Check container/service status.
3. Check recent deployment.
4. Check database connectivity.
5. Roll back if deployment caused issue.

## Database issue

1. Stop write traffic if data integrity is at risk.
2. Snapshot database.
3. Check migrations.
4. Restore only after confirming backup integrity.

## Security event

1. Disable affected account/API key.
2. Preserve audit logs.
3. Rotate secrets if needed.
4. Notify affected tenant if required.
