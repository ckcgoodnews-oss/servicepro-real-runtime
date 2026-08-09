# Disaster Recovery

Production RPO/RTO are **OPERATOR DECISION AND PROVIDER VERIFICATION REQUIRED**. Paid backup availability is not restore proof.

Recommended initial objectives pending business approval: database RPO ≤ 24 hours without PITR (or the verified PITR window when enabled); application RTO ≤ 1 hour; database recovery RTO ≤ 4 hours.

At least quarterly, restore the latest backup/PITR point to an isolated project, apply no production writes, run schema checks, row-count/integrity checks, tenant isolation, login, customer/job/invoice smoke, and record start/end times. Destroy the isolated restore only after evidence is retained according to policy.

Repositories and static frontend artifacts can be rebuilt from a tagged commit. Provider configuration, DNS, environment-variable names, and secret ownership must be inventoried separately; secret values remain in approved secret stores.
