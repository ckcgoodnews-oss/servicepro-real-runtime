# Sprint 88 - Route Planning Runtime

Apply this patch over Sprint 87.

## Endpoints to wire

```text
GET   /api/v1/route-plans
POST  /api/v1/route-plans
GET   /api/v1/route-plans/:id
PATCH /api/v1/route-plans/:id

GET   /api/v1/route-plans/:id/stops
POST  /api/v1/route-plans/:id/stops
POST  /api/v1/route-plans/:id/optimize
GET   /api/v1/route-plans/:id/summary
```

## Seed

```powershell
npm run seed:routes
```
