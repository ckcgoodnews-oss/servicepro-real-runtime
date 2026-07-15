# Sprint 723 Required Wiring

- The protected `/work-orders` workspace combines jobs, appointments, technicians, and customers from the existing tenant-scoped APIs.
- List, Kanban, and seven-day calendar views share the same work-order and assignment records.
- Status changes use `/api/v1/jobs/:id/transition`, preserving configured workflow rules and audit events.
- Assignments use the appointment API, including technician conflict detection and schedule permissions.
- PostgreSQL deployments must apply `723_work_order_experience.sql` for work-order and scheduling query indexes.
