# Sprint 63 - Customer Portal Runtime

Apply this patch over Sprint 62.

## What changed

- Added portal accounts.
- Added portal login.
- Added portal bearer token.
- Added customer booking requests.
- Added customer-visible invoices and estimates.
- Added admin portal account endpoints.
- Added PostgreSQL migration.

## Portal test login

```text
customer@example.com / ChangeMe123!
```

## Portal endpoints

```text
POST /portal/login
GET  /portal/api/me
GET  /portal/api/bookings
POST /portal/api/bookings
GET  /portal/api/invoices
GET  /portal/api/estimates
```

## Admin endpoints

```text
GET  /api/v1/portal/accounts
POST /api/v1/portal/accounts
GET  /api/v1/portal/bookings
```
