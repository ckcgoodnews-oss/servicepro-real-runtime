# ServicePro

ServicePro is a multi-industry field-service platform for plumbing, HVAC, carpet cleaning, landscaping, and other home and commercial service businesses. The Phase 46 web alpha includes authenticated operations, scheduling, customers, work orders, assets, reporting, organization settings, knowledge, notifications, and a broad service marketplace.

## Online alpha

The current release branch can be connected to a two-service Render test environment with the repository's root `render.yaml`. Follow [ONLINE_DEPLOYMENT.md](ONLINE_DEPLOYMENT.md) for the one-click Blueprint, verification steps, and the temporary-data warning.

Local and production-build testing instructions are in [WEBSITE_TESTING.md](WEBSITE_TESTING.md).

## Historical patch notes

### Sprint 151

Apply this ZIP over Sprint 150.

Sprint 151 adds privacy operations and data subject rights runtime support:
- Data subject requests
- Consent records
- Retention policies
- Deletion jobs
- Processing activities
- DPIA assessments
- Privacy breach notifications
- PostgreSQL migration, seed, tests, wiring notes, and Git commands
