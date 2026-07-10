# Sprint 94 - AI Dispatch Runtime

Apply this patch over Sprint 93.

This sprint adds deterministic AI-assisted dispatch recommendation support. The scoring is explainable and auditable. It can later be replaced or augmented by ML without changing the dispatch workflow contract.

## Endpoints to wire

```text
GET  /api/v1/ai-dispatch/requests
POST /api/v1/ai-dispatch/requests

GET  /api/v1/ai-dispatch/recommendations
POST /api/v1/ai-dispatch/recommendations/generate
GET  /api/v1/ai-dispatch/recommendations/:id
POST /api/v1/ai-dispatch/recommendations/:id/accept
POST /api/v1/ai-dispatch/recommendations/:id/reject
```

## Seed

```powershell
npm run seed:ai-dispatch
```
