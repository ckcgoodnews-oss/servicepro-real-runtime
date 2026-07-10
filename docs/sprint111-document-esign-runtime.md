# Sprint 111 - Document and E-Signature Runtime

Apply this patch over Sprint 110.

## Endpoints to wire

```text
GET  /api/v1/documents/templates
POST /api/v1/documents/templates
GET  /api/v1/documents/packets
POST /api/v1/documents/packets
POST /api/v1/documents/packets/:id/generate
GET  /api/v1/documents/packets/:id/approvals
POST /api/v1/documents/packets/:id/approvals
POST /api/v1/documents/approvals/:id/approve
POST /api/v1/documents/approvals/:id/reject
POST /api/v1/documents/packets/:id/signature-requests
POST /api/v1/documents/signature-requests/:id/send
GET  /api/v1/documents/signature-requests/:id/recipients
POST /api/v1/documents/signature-requests/:id/recipients
POST /api/v1/documents/signature-recipients/:id/sign
POST /api/v1/documents/signature-recipients/:id/decline
GET  /api/v1/documents/packets/:id/audit
```

## Seed

```powershell
npm run seed:documents
```
