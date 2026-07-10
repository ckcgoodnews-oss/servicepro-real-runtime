# Sprint 99 - White-Label Branding Runtime

Apply this patch over Sprint 98.

## Endpoints to wire

```text
GET   /api/v1/branding/brands
POST  /api/v1/branding/brands
GET   /api/v1/branding/brands/:id
PATCH /api/v1/branding/brands/:id

GET  /api/v1/branding/brands/:id/assets
POST /api/v1/branding/brands/:id/assets

GET  /api/v1/branding/brands/:id/domains
POST /api/v1/branding/brands/:id/domains
POST /api/v1/branding/domains/:id/verify

GET /api/v1/branding/brands/:id/resolve
GET /api/v1/branding/brands/:id/theme.css
```

## Seed

```powershell
npm run seed:branding
```
