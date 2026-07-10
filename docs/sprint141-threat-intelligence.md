# Sprint 141 - Threat Intelligence

Apply this patch over Sprint 140.

## Endpoints to wire

```text
GET  /api/v1/threat-intelligence/feeds
POST /api/v1/threat-intelligence/feeds
POST /api/v1/threat-intelligence/feeds/:id/pause
POST /api/v1/threat-intelligence/feeds/:id/activate
GET  /api/v1/threat-intelligence/indicators
POST /api/v1/threat-intelligence/indicators
POST /api/v1/threat-intelligence/indicators/:id/refresh
GET  /api/v1/threat-intelligence/actors
POST /api/v1/threat-intelligence/actors
POST /api/v1/threat-intelligence/campaigns
POST /api/v1/threat-intelligence/campaigns/:id/activate
GET  /api/v1/threat-intelligence/sightings
POST /api/v1/threat-intelligence/sightings
POST /api/v1/threat-intelligence/enrichments
POST /api/v1/threat-intelligence/enrichments/:id/complete
POST /api/v1/threat-intelligence/enrichments/:id/fail
POST /api/v1/threat-intelligence/watchlists
POST /api/v1/threat-intelligence/watchlists/:id/retire
GET  /api/v1/threat-intelligence/metrics
```

## Seed

```powershell
npm run seed:threat-intelligence
```
