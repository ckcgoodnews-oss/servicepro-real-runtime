# Sprint 721 Required Wiring

- The protected `/organization` workspace uses `/api/v1/organization` for tenant-scoped organization-unit CRUD.
- Owners and administrators inherit organization read, write, and delete permissions; managers can read and write but cannot delete.
- PostgreSQL deployments must apply `721_organization_management.sql` before enabling the workspace.
- Organization units support organizations, business units, departments, locations, and teams with optional parent relationships.
- Units with children cannot be deleted until their children are moved or removed.
