# ServicePro Production Runbook

## First response

1. Record start time, user impact, affected tenant(s), and last known-good release.
2. Check the canonical frontend, API `/healthz`, and `/readyz` from outside the provider network.
3. Correlate Render deploy/logs, Cloudflare deployment, Supabase status/pool, Stripe events, and email provider events by time and request/event ID.
4. Do not paste secrets or customer payloads into the incident record.

## API / Render

Inspect recent deploy SHA and logs. If a new release caused the incident, use Render’s last-known-good rollback, then rerun health/readiness and smoke tests. Restart only when evidence indicates a stuck process; repeated restarts can hide database exhaustion.

## Frontend / Cloudflare

Confirm DNS/certificate, Worker version, and static assets. Roll back to the previous Worker deployment if the current artifact is defective, then verify canonical redirects, login, and API calls.

## Supabase

Check provider status, connection count/pool saturation, slow queries, locks, and recent migrations. Do not restore over production. For corruption/data loss, isolate writes, preserve evidence, and follow `DISASTER-RECOVERY.md`.

## Stripe

If ledger integrity is uncertain, disable payment entry rather than accepting unverified payments. Preserve webhook events, inspect retry backlog, and reconcile against Stripe before re-enabling.

## Email

Check provider status, domain authentication, suppression/bounce events, and configuration. Never issue a new reset token merely to conceal a delivery failure; surface retry safely.

## Security

Contain the affected integration, revoke/rotate the credential class, invalidate sessions where required, preserve audit logs, and identify tenant impact. A committed credential is a security incident even if it was later deleted.
