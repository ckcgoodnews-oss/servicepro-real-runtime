# Sprint 125 - Evidence Fulfillment

Apply this patch over Sprint 124.

## Endpoints to wire

```text
GET  /api/v1/evidence-fulfillment/bundles
POST /api/v1/evidence-fulfillment/bundles
POST /api/v1/evidence-fulfillment/bundles/:id/ready
POST /api/v1/evidence-fulfillment/bundles/:id/approve
GET  /api/v1/evidence-fulfillment/bundles/:id/items
POST /api/v1/evidence-fulfillment/bundles/:id/items
GET  /api/v1/evidence-fulfillment/requests
POST /api/v1/evidence-fulfillment/requests
POST /api/v1/evidence-fulfillment/requests/:id/approve
POST /api/v1/evidence-fulfillment/requests/:id/reject
POST /api/v1/evidence-fulfillment/requests/:id/approvals
POST /api/v1/evidence-fulfillment/approvals/:id/approve
POST /api/v1/evidence-fulfillment/approvals/:id/reject
POST /api/v1/evidence-fulfillment/requests/:id/links
POST /api/v1/evidence-fulfillment/links/:id/open
POST /api/v1/evidence-fulfillment/requests/:id/deliver
POST /api/v1/evidence-fulfillment/links/:id/revoke
GET  /api/v1/evidence-fulfillment/links
GET  /api/v1/evidence-fulfillment/events
GET  /api/v1/evidence-fulfillment/metrics
```

## Seed

```powershell
npm run seed:evidence-fulfillment
```
