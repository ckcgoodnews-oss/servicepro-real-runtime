# Sprint 59 - Services and Price Book Runtime

Apply this patch over Sprint 58.

## What changed

- Added `/api/v1/services`.
- Added service catalog repository.
- Added plumbing service seed data.
- Added price-book line resolver.
- Estimates/invoices can now accept service-code lines.

## Example service-code estimate line

```json
{
  "customerId": "cust_demo_1",
  "jobId": "job_demo_1",
  "taxRate": 0.07,
  "lines": [
    { "serviceCode": "DRAIN-CLEAN", "quantity": 1 }
  ]
}
```

## Endpoints

```text
GET    /api/v1/services
POST   /api/v1/services
GET    /api/v1/services/:id
PATCH  /api/v1/services/:id
DELETE /api/v1/services/:id
```
