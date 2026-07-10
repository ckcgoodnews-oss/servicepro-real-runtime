# Sprint 66 - Export Runtime

Apply this patch over Sprint 65.

## Endpoints

```text
GET  /api/v1/exports
POST /api/v1/exports
```

## Export keys

```text
customers
jobs
invoices
payments
inventory
portal-bookings
report-revenue
report-dashboard
report-inventory-value
```

## Example body

```json
{
  "exportKey": "customers"
}
```
