# Sprint 718 Required Wiring

- The dashboard reads `GET /api/v1/dashboard/summary` with the current tenant and bearer token.
- Access requires the existing `reports.read` permission.
- Summary data is assembled from tenant-scoped jobs, appointments, customers, invoices, notifications, and audit repositories.
- Empty tenants receive zero KPIs and empty states rather than demonstration values.
- The dashboard refreshes when the route is loaded; realtime subscriptions arrive in Sprint 725.
