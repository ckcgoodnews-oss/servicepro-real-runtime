# Sprint 129 - Privacy Rights and DSAR

Apply this patch over Sprint 128.

## Endpoints to wire

```text
GET  /api/v1/privacy-rights/requests
POST /api/v1/privacy-rights/requests
POST /api/v1/privacy-rights/requests/:id/start-verification
POST /api/v1/privacy-rights/requests/:id/verifications
POST /api/v1/privacy-rights/verifications/:id/verify
POST /api/v1/privacy-rights/verifications/:id/fail
GET  /api/v1/privacy-rights/requests/:id/search-tasks
POST /api/v1/privacy-rights/requests/:id/search-tasks
POST /api/v1/privacy-rights/search-tasks/:id/start
POST /api/v1/privacy-rights/search-tasks/:id/complete
POST /api/v1/privacy-rights/requests/:id/packages
POST /api/v1/privacy-rights/packages/:id/ready
POST /api/v1/privacy-rights/packages/:id/approve
POST /api/v1/privacy-rights/requests/:id/approvals
POST /api/v1/privacy-rights/approvals/:id/approve
POST /api/v1/privacy-rights/approvals/:id/reject
POST /api/v1/privacy-rights/requests/:id/fulfillments
POST /api/v1/privacy-rights/fulfillments/:id/send
POST /api/v1/privacy-rights/fulfillments/:id/fail
POST /api/v1/privacy-rights/requests/:id/reject
GET  /api/v1/privacy-rights/metrics
```

## Seed

```powershell
npm run seed:privacy-rights
```
