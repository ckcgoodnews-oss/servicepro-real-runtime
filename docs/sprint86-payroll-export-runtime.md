# Sprint 86 - Payroll Export Runtime

Apply this patch over Sprint 85.

## Endpoints to wire

```text
GET  /api/v1/payroll/periods
POST /api/v1/payroll/periods

GET  /api/v1/payroll/exports
POST /api/v1/payroll/exports/generate
GET  /api/v1/payroll/exports/:id
POST /api/v1/payroll/exports/:id/approve
POST /api/v1/payroll/exports/:id/mark-exported
```

## Seed

```powershell
npm run seed:payroll
```
