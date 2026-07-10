# Sprint 55 - Auth Runtime

Apply this patch over Sprint 54.

## What changed

- Added `/auth/login`.
- Added `/api/v1/me`.
- Added HMAC JWT-style access token service.
- Replaced static token guard with token verification.
- Added password hashing using bcryptjs.
- Added user repository for JSON and PostgreSQL.
- Added auth seed script.
- Added runtime auth PostgreSQL migration.

## Commands

```powershell
npm install
npm test
```

Run JSON mode:

```powershell
$env:DATA_STORE="json"
npm run reset
npm run dev
```

Login:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"email":"owner@example.com","password":"ChangeMe123!"}' http://localhost:3000/auth/login
```

PostgreSQL mode:

```powershell
$env:DATA_STORE="postgres"
npm run migrate
node scripts/seed-auth.js
npm run dev
```
