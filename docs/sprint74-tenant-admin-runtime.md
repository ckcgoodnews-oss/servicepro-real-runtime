# Sprint 74 - Tenant Administration Runtime

Apply this patch over Sprint 73.

## Added

- Tenant settings
- Branding/white-label configuration
- Feature flags
- Public tenant profile
- Admin tenant routes
- PostgreSQL tenant settings migration

## Endpoints

```text
GET   /tenant-profile
GET   /portal/api/tenant-profile

GET   /api/v1/tenant/settings
PATCH /api/v1/tenant/settings
PATCH /api/v1/tenant/branding
PATCH /api/v1/tenant/features
```

## Seed command

```powershell
npm run seed:tenant
```

## Example branding body

```json
{
  "appName": "My Field Service",
  "primaryColor": "#005bbb",
  "portalWelcomeTitle": "Welcome"
}
```

## Example feature body

```json
{
  "inventory": true,
  "reports": true,
  "customerPortal": true
}
```
