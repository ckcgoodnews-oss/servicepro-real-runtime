# Sprint 147 - Customer Success and Onboarding

Apply this patch over Sprint 146.

## Endpoints to wire

```text
POST /api/v1/customer-success/cohorts
POST /api/v1/customer-success/cohorts/:id/activate
POST /api/v1/customer-success/cohorts/:id/complete
POST /api/v1/customer-success/plans
POST /api/v1/customer-success/plans/:id/start
POST /api/v1/customer-success/plans/:id/complete
POST /api/v1/customer-success/plans/:id/block
POST /api/v1/customer-success/plans/:id/tasks
POST /api/v1/customer-success/tasks/:id/start
POST /api/v1/customer-success/tasks/:id/complete
POST /api/v1/customer-success/adoption-metrics
POST /api/v1/customer-success/feedback
POST /api/v1/customer-success/feedback/:id/review
POST /api/v1/customer-success/feedback/:id/resolve
POST /api/v1/customer-success/escalations
POST /api/v1/customer-success/escalations/:id/start
POST /api/v1/customer-success/escalations/:id/resolve
POST /api/v1/customer-success/escalations/:id/close
POST /api/v1/customer-success/success-plans
POST /api/v1/customer-success/success-plans/:id/activate
POST /api/v1/customer-success/success-plans/:id/at-risk
GET  /api/v1/customer-success/metrics
```

## Seed

```powershell
npm run seed:customer-success
```
