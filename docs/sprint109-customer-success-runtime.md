# Sprint 109 - Customer Success Runtime

Apply this patch over Sprint 108.

## Endpoints to wire

```text
GET  /api/v1/customer-success/account-plans
POST /api/v1/customer-success/account-plans
GET  /api/v1/customer-success/account-plans/:id/milestones
POST /api/v1/customer-success/account-plans/:id/milestones
POST /api/v1/customer-success/milestones/:id/complete

GET  /api/v1/customer-success/tasks
POST /api/v1/customer-success/tasks
POST /api/v1/customer-success/tasks/:id/complete

GET  /api/v1/customer-success/account-plans/:id/qbrs
POST /api/v1/customer-success/account-plans/:id/qbrs
POST /api/v1/customer-success/qbrs/:id/complete

GET  /api/v1/customer-success/account-plans/:id/renewal-risks
POST /api/v1/customer-success/account-plans/:id/renewal-risks
POST /api/v1/customer-success/renewal-risks/:id/resolve

GET  /api/v1/customer-success/account-plans/:id/score
```

## Seed

```powershell
npm run seed:customer-success
```
