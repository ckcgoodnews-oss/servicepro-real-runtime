# Sprint 3 Notes

Sprint 3 adds field-service financial and dispatch workflow modules while preserving the simple JSON datastore for local development.

## Added

- Dispatch calendar/list screen
- Technician assignment and scheduled time updates from dispatch
- Estimate creation
- Estimate detail with line items
- Estimate status workflow
- Quote/estimate conversion into a job
- Invoice creation
- Invoice detail with line items
- Manual payment recording
- PostgreSQL target migration for estimates and invoices

## New routes

- `/admin/dispatch`
- `/admin/estimates`
- `/admin/estimates/:id`
- `/admin/invoices`
- `/admin/invoices/:id`

## Notes

This sprint still uses the JSON datastore by default so it can be run without native database dependencies. The PostgreSQL migration is included under `src/db/postgres` for the later production adapter sprint.
