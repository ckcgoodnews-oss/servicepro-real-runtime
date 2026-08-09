# Production Rollback

Target application rollback is under five minutes once an operator decides to roll back. Database recovery has a separate RTO.

- API: Render → production service → Deploys → select last-known-good → Rollback. Verify SHA, `/healthz`, `/readyz`, authentication, and critical API smoke.
- Web: Cloudflare → Worker → Deployments → roll back the version. Verify domain, assets, login, and API origin.
- Environment: restore only the previously recorded non-secret configuration/versioned secret reference; redeploy and verify. Never copy secrets into Git.
- Database: prefer forward repair. Do not reverse destructive migrations without a tested rollback and backup. Stop writes when schema/data compatibility is uncertain.
- Stripe/email: disabling entry or delivery is safer than accepting/claiming success with an inconsistent integration. Preserve event queues for reconciliation.

Every rollback record must include incident ID, previous/current SHA, migration state, operator, timestamps, and verification outcome.
