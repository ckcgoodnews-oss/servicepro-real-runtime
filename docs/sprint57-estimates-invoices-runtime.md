# Sprint 57 - Estimates, Invoices, and Pricing Runtime

Apply this patch over Sprint 56.

## What changed

- Added pricing calculation service.
- Added estimate repository.
- Added invoice repository.
- Added estimates API.
- Added invoices API.
- Added RBAC permissions for estimates/invoices.
- Added JSON seed records.
- Added PostgreSQL migration.

## Example endpoints

```text
GET  /api/v1/estimates
POST /api/v1/estimates
GET  /api/v1/invoices
POST /api/v1/invoices
```

## Example body

```json
{
  "customerId": "cust_demo_1",
  "jobId": "job_demo_1",
  "taxRate": 0.07,
  "lines": [
    {
      "code": "DRAIN-CLEAN",
      "name": "Drain cleaning",
      "quantity": 1,
      "unitPrice": 225,
      "unitCost": 85,
      "taxable": true
    }
  ]
}
```
