# Sprint 142 - SIEM and Detection Engineering

Apply this patch over Sprint 141.

## Endpoints to wire

```text
GET  /api/v1/siem-detection/sources
POST /api/v1/siem-detection/sources
POST /api/v1/siem-detection/sources/:id/activate
POST /api/v1/siem-detection/sources/:id/degrade
GET  /api/v1/siem-detection/rules
POST /api/v1/siem-detection/rules
POST /api/v1/siem-detection/rules/:id/activate
POST /api/v1/siem-detection/rules/:id/disable
POST /api/v1/siem-detection/rules/:id/tests
POST /api/v1/siem-detection/tests/:id/run
GET  /api/v1/siem-detection/alerts
POST /api/v1/siem-detection/alerts
POST /api/v1/siem-detection/alerts/:id/triage
POST /api/v1/siem-detection/alerts/:id/investigate
POST /api/v1/siem-detection/alerts/:id/escalate
POST /api/v1/siem-detection/alerts/:id/close
POST /api/v1/siem-detection/alerts/:id/false-positive
POST /api/v1/siem-detection/suppressions
POST /api/v1/siem-detection/tunings
POST /api/v1/siem-detection/tunings/:id/approve
POST /api/v1/siem-detection/tunings/:id/apply
GET  /api/v1/siem-detection/metrics
```

## Seed

```powershell
npm run seed:siem-detection
```
