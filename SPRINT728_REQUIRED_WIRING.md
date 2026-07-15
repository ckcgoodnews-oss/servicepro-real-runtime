# Sprint 728 Required Wiring

- The marketplace catalog contains 30 service-industry packs plus universal connectors, extensions, and themes.
- JSON runtimes merge newly published catalog entries by stable code while preserving installations and existing records.
- PostgreSQL environments receive the expanded catalog through migration `728_expanded_service_catalog.sql`.
- The Marketplace industry filter is derived from published catalog data so future trades require no frontend filter changes.
- Run `npm run test:sprint728`, migration checks, both web builds, and the complete regression suite before release.
