# Sprint 722 Required Wiring

- The protected `/assets` workspace uses `/api/v1/assets` for tenant-scoped equipment browsing and updates.
- Service events are available under `/api/v1/assets/:id/history` and asset document metadata under `/api/v1/assets/:id/attachments`.
- PostgreSQL deployments must apply `722_asset_management_experience.sql`; the base asset, history, and media tables come from Sprints 77 and 82.
- Owners and administrators inherit asset read/write permissions; technician and read-only access follows the existing role permission presets.
- Attachment records store safe metadata and storage keys. Binary file delivery remains owned by the configured storage provider.
