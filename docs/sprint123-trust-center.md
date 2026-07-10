# Sprint 123 - Customer Trust Center

Apply this patch over Sprint 122.

## Endpoints to wire

```text
GET  /api/v1/trust-center/profiles
POST /api/v1/trust-center/profiles
POST /api/v1/trust-center/profiles/:id/publish
GET  /api/v1/trust-center/documents
POST /api/v1/trust-center/documents
POST /api/v1/trust-center/documents/:id/publish
GET  /api/v1/trust-center/access-requests
POST /api/v1/trust-center/documents/:id/access-requests
POST /api/v1/trust-center/access-requests/:id/sign-nda
POST /api/v1/trust-center/access-requests/:id/approve
POST /api/v1/trust-center/access-requests/:id/reject
GET  /api/v1/trust-center/shares
POST /api/v1/trust-center/access-requests/:id/shares
POST /api/v1/trust-center/shares/:id/view
POST /api/v1/trust-center/shares/:id/revoke
GET  /api/v1/trust-center/audit
GET  /api/v1/trust-center/metrics
```

## Seed

```powershell
npm run seed:trust-center
```
