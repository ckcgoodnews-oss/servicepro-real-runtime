# Sprint 11 API Documentation

## Authentication

Use a bearer token:

```http
Authorization: Bearer sp_xxxxxxxxx
```

## Scopes

```text
customers.read
customers.write
jobs.read
jobs.write
services.read
*
```

## Endpoints

```text
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/jobs
POST   /api/v1/jobs
PATCH  /api/v1/jobs/:id
GET    /api/v1/services
```

## Webhook events

```text
customer.created
job.created
job.updated
```
