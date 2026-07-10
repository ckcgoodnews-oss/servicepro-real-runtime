# Sprint 81 - Mobile Checklists Runtime

Apply this patch over Sprint 80.

## Endpoints to wire

```text
GET  /api/v1/checklist-templates
POST /api/v1/checklist-templates
GET  /api/v1/job-checklists
POST /api/v1/checklist-templates/:templateId/create-job-checklist
PATCH /api/v1/job-checklists/:checklistId/items/:itemCode
POST /api/v1/job-checklists/:checklistId/complete
```

## Seed

```powershell
npm run seed:checklists
```
