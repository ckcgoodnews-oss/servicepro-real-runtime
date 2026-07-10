# Sprint 70 - Validation and Data Integrity Runtime

Apply this patch over Sprint 69.

## Added

- Domain error helpers.
- Safe JSON parsing.
- Route validation registry.
- Integrity check service.
- Integrity check repository.
- PostgreSQL integrity migration.

## Endpoints

```text
GET  /api/v1/integrity
POST /api/v1/integrity/run
```
