# Sprint 67 - Audit Runtime

Apply this patch over Sprint 66.

## Endpoints

```text
GET  /api/v1/audit
POST /api/v1/audit
```

## Example manual audit event

```json
{
  "eventType": "entity.activity",
  "entityType": "job",
  "entityId": "job_demo_1",
  "action": "manual.review",
  "metadata": {
    "note": "Reviewed by manager"
  }
}
```
