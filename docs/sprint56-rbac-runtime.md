# Sprint 56 - Runtime RBAC

Apply this patch over Sprint 55.

## What changed

- Added permission catalog.
- Added role preset expansion.
- Added `requirePermission` middleware.
- Protected customer/job CRUD by permission.
- Added `/api/v1/authz`.
- Added auth event repository.
- JSON seed now includes owner and technician users.
- Technician can read/write jobs but cannot delete customers/jobs.
- Added PostgreSQL RBAC metadata migration.

## Test users

```text
owner@example.com / ChangeMe123!
tech@example.com / ChangeMe123!
```

## Commands

```powershell
npm install
npm test
```
