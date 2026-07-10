# Sprint 75 - Workflow Runtime

Apply this patch over Sprint 74.

## Added

- Job lifecycle workflow rules
- Workflow transition validation
- Workflow events
- Job transition route
- Workflow seed helper

## Endpoints

```text
GET  /api/v1/workflows
POST /api/v1/workflows
GET  /api/v1/workflow-events

POST /api/v1/jobs/:id/transition
```

## Example transition body

```json
{
  "status": "scheduled",
  "notes": "Customer confirmed appointment"
}
```

## Seed command

```powershell
npm run seed:workflow
```
