# Sprint 87 - Territory Routing Runtime

Apply this patch over Sprint 86.

## Endpoints to wire

```text
GET  /api/v1/territories
POST /api/v1/territories
POST /api/v1/territories/match

GET  /api/v1/territory-rules
POST /api/v1/territory-rules
GET  /api/v1/territories/:id/rules
POST /api/v1/territories/:id/rules

GET  /api/v1/technician-territories
POST /api/v1/technician-territories
GET  /api/v1/territories/:id/technicians
POST /api/v1/territories/:id/technicians
```

## Seed

```powershell
npm run seed:territories
```
