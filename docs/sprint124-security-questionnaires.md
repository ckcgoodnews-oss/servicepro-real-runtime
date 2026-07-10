# Sprint 124 - Customer Security Questionnaires

Apply this patch over Sprint 123.

## Endpoints to wire

```text
GET  /api/v1/security-questionnaires
POST /api/v1/security-questionnaires
GET  /api/v1/security-questionnaires/:id/questions
POST /api/v1/security-questionnaires/:id/questions
POST /api/v1/security-questionnaires/questions/:id/approve
POST /api/v1/security-questionnaires/questions/:id/reject
GET  /api/v1/security-questionnaires/answers
POST /api/v1/security-questionnaires/answers
POST /api/v1/security-questionnaires/:id/submit-review
POST /api/v1/security-questionnaires/:id/reviews
POST /api/v1/security-questionnaires/reviews/:id/approve
POST /api/v1/security-questionnaires/reviews/:id/reject
POST /api/v1/security-questionnaires/:id/mark-sent
POST /api/v1/security-questionnaires/:id/exports
POST /api/v1/security-questionnaires/exports/:id/start
POST /api/v1/security-questionnaires/exports/:id/complete
GET  /api/v1/security-questionnaires/metrics
```

## Seed

```powershell
npm run seed:security-questionnaires
```
