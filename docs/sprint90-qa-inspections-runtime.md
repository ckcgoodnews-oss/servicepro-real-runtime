# Sprint 90 - QA Inspections Runtime

Apply this patch over Sprint 89.

## Endpoints to wire

```text
GET  /api/v1/qa/templates
POST /api/v1/qa/templates

GET  /api/v1/qa/inspections
GET  /api/v1/qa/inspections/:id
POST /api/v1/qa/templates/:templateId/create-inspection
PATCH /api/v1/qa/inspections/:inspectionId/items/:itemCode
POST /api/v1/qa/inspections/:inspectionId/complete
GET  /api/v1/qa/inspections/:inspectionId/score
```

## Seed

```powershell
npm run seed:qa
```
