# Sprint 54 - Executable PostgreSQL Runtime

Apply this patch over Sprint 53.

## What changed

- `pg` dependency added.
- Real PostgreSQL adapter implemented.
- Customer repository supports PostgreSQL CRUD.
- Job repository supports PostgreSQL CRUD.
- Migration runner added.
- PostgreSQL seed script added.
- Runtime remains compatible with JSON mode.

## Commands

### Install

```powershell
npm install
```

### Run JSON mode

```powershell
$env:DATA_STORE="json"
npm run dev
```

### Run PostgreSQL mode

```powershell
$env:DATA_STORE="postgres"
$env:DATABASE_URL="postgresql://servicepro:servicepro@localhost:5432/servicepro"
npm run migrate
node scripts/seed-postgres.js
npm run dev
```

### Test API

```powershell
Invoke-RestMethod -Headers @{Authorization='Bearer dev-token-change-me'; 'x-tenant-id'='tenant_demo'} http://localhost:3000/api/v1/customers
```
