# Sprint 58 - Payments Runtime

Apply this patch over Sprint 57.

## What changed

- Added payment recording.
- Added payment repository.
- Added payment API routes.
- Invoice balances update when payment is posted.
- Invoice status updates to `partially_paid` or `paid`.
- Added payments RBAC permissions.
- Added PostgreSQL payment migration.

## Endpoints

```text
GET    /api/v1/payments
POST   /api/v1/payments
DELETE /api/v1/payments/:id
```

## Example body

```json
{
  "invoiceId": "inv_demo_1",
  "customerId": "cust_demo_1",
  "amount": 100,
  "method": "cash",
  "reference": "counter-payment"
}
```
