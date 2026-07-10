# Sprint 144 - Governance Dashboards and Executive Reporting

Apply this patch over Sprint 143.

## Endpoints to wire

```text
GET  /api/v1/governance-reporting/kpis
POST /api/v1/governance-reporting/kpis
POST /api/v1/governance-reporting/kpis/:id/activate
POST /api/v1/governance-reporting/dashboards
POST /api/v1/governance-reporting/dashboards/:id/publish
GET  /api/v1/governance-reporting/dashboards/:id/widgets
POST /api/v1/governance-reporting/dashboards/:id/widgets
POST /api/v1/governance-reporting/templates
POST /api/v1/governance-reporting/templates/:id/activate
POST /api/v1/governance-reporting/snapshots
POST /api/v1/governance-reporting/snapshots/:id/generate
POST /api/v1/governance-reporting/snapshots/:id/fail
POST /api/v1/governance-reporting/deliveries
POST /api/v1/governance-reporting/deliveries/:id/send
POST /api/v1/governance-reporting/deliveries/:id/fail
POST /api/v1/governance-reporting/exports
POST /api/v1/governance-reporting/exports/:id/start
POST /api/v1/governance-reporting/exports/:id/complete
GET  /api/v1/governance-reporting/metrics
```

## Seed

```powershell
npm run seed:governance-reporting
```
