# Sprint 134 - Policy Lifecycle and Attestations

Apply this patch over Sprint 133.

## Endpoints to wire

```text
GET  /api/v1/policy-lifecycle/policies
POST /api/v1/policy-lifecycle/policies
GET  /api/v1/policy-lifecycle/policies/:id/versions
POST /api/v1/policy-lifecycle/policies/:id/versions
POST /api/v1/policy-lifecycle/versions/:id/submit
POST /api/v1/policy-lifecycle/versions/:id/approve
POST /api/v1/policy-lifecycle/versions/:id/publish
POST /api/v1/policy-lifecycle/versions/:id/approvals
POST /api/v1/policy-lifecycle/approvals/:id/approve
POST /api/v1/policy-lifecycle/approvals/:id/reject
GET  /api/v1/policy-lifecycle/attestations
POST /api/v1/policy-lifecycle/policies/:id/attestations
POST /api/v1/policy-lifecycle/attestations/:id/acknowledge
POST /api/v1/policy-lifecycle/attestations/mark-overdue
POST /api/v1/policy-lifecycle/policies/:id/exceptions
POST /api/v1/policy-lifecycle/exceptions/:id/approve
POST /api/v1/policy-lifecycle/exceptions/:id/reject
POST /api/v1/policy-lifecycle/policies/:id/reviews
POST /api/v1/policy-lifecycle/reviews/:id/complete
GET  /api/v1/policy-lifecycle/metrics
```

## Seed

```powershell
npm run seed:policy-lifecycle
```
