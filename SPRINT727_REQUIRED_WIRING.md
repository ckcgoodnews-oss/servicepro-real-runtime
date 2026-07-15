# Sprint 727 Required Wiring

- The protected `/marketplace` workspace separates universal platform capabilities from optional industry-specific packs.
- Initial packs cover plumbing, HVAC, carpet and upholstery cleaning, and landscaping; the catalog supports additional service industries without changing core records.
- Universal connectors, communications, themes, scheduling, customers, billing, assets, notifications, and reporting remain industry-neutral.
- Installations are tenant-scoped and persisted with JSON/PostgreSQL parity.
- PostgreSQL deployments must apply `727_marketplace_experience.sql` before enabling marketplace installation actions.
