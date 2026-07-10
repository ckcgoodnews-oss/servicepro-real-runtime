# Sprint 50 - Executable API Runtime

Implemented:
- Native Node HTTP server.
- Health/readiness endpoints.
- Bearer-token auth guard.
- Tenant middleware using `x-tenant-id`.
- In-memory customer service.
- In-memory job service.
- Customer/job API routes.
- Runtime smoke tests.

Run:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Test API:

```powershell
Invoke-RestMethod -Headers @{Authorization='Bearer dev-token-change-me'} http://localhost:3000/api/v1/customers
```
