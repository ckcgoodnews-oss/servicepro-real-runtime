# Sprint 138 - Asset Inventory and Configuration Compliance

Apply this patch over Sprint 137.

## Endpoints to wire

```text
GET  /api/v1/asset-config/assets
POST /api/v1/asset-config/assets
POST /api/v1/asset-config/assets/:id/activate
POST /api/v1/asset-config/assets/:id/quarantine
POST /api/v1/asset-config/baselines
POST /api/v1/asset-config/baselines/:id/activate
GET  /api/v1/asset-config/baselines/:id/rules
POST /api/v1/asset-config/baselines/:id/rules
POST /api/v1/asset-config/scans
POST /api/v1/asset-config/scans/:id/start
POST /api/v1/asset-config/scans/:id/run
GET  /api/v1/asset-config/findings
POST /api/v1/asset-config/findings/:id/resolve
POST /api/v1/asset-config/findings/:id/accept-risk
POST /api/v1/asset-config/findings/:id/remediations
POST /api/v1/asset-config/remediations/:id/complete
GET  /api/v1/asset-config/metrics
```

## Seed

```powershell
npm run seed:asset-config
```
