# Sprint 726 Required Wiring

- The protected `/reports` workspace reads tenant-scoped dashboard, revenue, job-status, inventory, export, and schedule data.
- Charts use accessible HTML and CSS representations with visible values rather than image-only graphics.
- CSV downloads use the existing export API and record every generated export in tenant history.
- Report schedules persist recipients, cadence, next delivery, and active state through JSON/PostgreSQL repository parity.
- PostgreSQL deployments must apply `726_reporting_experience.sql` before enabling report scheduling.
