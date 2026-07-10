# Sprint 51 - Persistent Runtime Store and CRUD

Implemented:
- Persistent JSON datastore.
- Customer CRUD.
- Job CRUD.
- Validation helper functions.
- API smoke client.
- Runtime tests.

Example:

```powershell
npm run reset
npm run dev
```

Then:

```powershell
Invoke-RestMethod -Headers @{Authorization='Bearer dev-token-change-me'} http://localhost:3000/api/v1/customers
```
