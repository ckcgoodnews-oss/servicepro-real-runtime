# ServicePro 8.0.0-alpha.1 — Initial Release Certification

**Assessment date:** 2026-07-27  
**Branch:** `release/8.0.0-alpha.1-remediation`  
**Starting point:** `main`  
**Initial decision:** **NO-GO**

## Initial release blockers

| Area | Initial result | Release impact |
|---|---|---|
| Automated suite | Fail — 7 known failures | Blocking |
| Invoice payment application | Fail — missing domain implementation and PostgreSQL audit persistence | Blocking |
| Fresh PostgreSQL deployment | Fail — migrations 779 and 780 were not portable to the supported database | Blocking |
| Frontend clean installation/build | Unverified; installation appeared stalled and lockfile ownership was ambiguous | Blocking |
| Production deployment configuration | Fail — version, persistence, secret, and migration settings were inconsistent | Blocking |
| Package commands | Fail — published commands referenced nonexistent seed scripts | Blocking |
| Browser workflow | Unverified | Blocking |
| Backup/restore | Unverified | Blocking |

## Certification rule

This release could not be approved from test names or static assertions alone. Approval required reproducible evidence for:

1. Clean dependency installation and production build.
2. The complete automated suite.
3. A blank PostgreSQL migration, migration replay, transactional business flows, tenant isolation, backup, and restore.
4. Authenticated browser behavior at desktop and mobile breakpoints.
5. Fail-closed production configuration with durable persistence and explicit secrets.

The final disposition is recorded in `FINAL-RELEASE-CERTIFICATION.md`.
