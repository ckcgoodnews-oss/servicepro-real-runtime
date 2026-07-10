# Sprint 92 - Customer Surveys Runtime

Apply this patch over Sprint 91.

## Endpoints to wire

```text
GET  /api/v1/surveys/templates
POST /api/v1/surveys/templates

GET  /api/v1/surveys/sends
POST /api/v1/surveys/sends
POST /api/v1/surveys/sends/:id/mark-sent

GET  /api/v1/surveys/responses
POST /api/v1/surveys/responses
POST /api/v1/surveys/summary
```

## Seed

```powershell
npm run seed:surveys
```
