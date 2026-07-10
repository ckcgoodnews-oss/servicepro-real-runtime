# Sprint 102 - Compliance Evidence Runtime

Apply this patch over Sprint 101.

## Endpoints to wire

```text
GET  /api/v1/compliance/frameworks
POST /api/v1/compliance/frameworks
GET  /api/v1/compliance/controls
POST /api/v1/compliance/controls
GET  /api/v1/compliance/packages
POST /api/v1/compliance/packages
GET  /api/v1/compliance/evidence
POST /api/v1/compliance/evidence
POST /api/v1/compliance/evidence/:id/review
GET  /api/v1/compliance/mappings
POST /api/v1/compliance/mappings
POST /api/v1/compliance/attestations
POST /api/v1/compliance/attestations/:id/approve
POST /api/v1/compliance/exports
POST /api/v1/compliance/exports/:id/complete
POST /api/v1/compliance/score
```

## Seed

```powershell
npm run seed:compliance
```
