# Sprint 130 - Consent and Preference Management

Apply this patch over Sprint 129.

## Endpoints to wire

```text
GET  /api/v1/consent-preferences/purposes
POST /api/v1/consent-preferences/purposes
GET  /api/v1/consent-preferences/subjects
POST /api/v1/consent-preferences/subjects
POST /api/v1/consent-preferences/subjects/:id/suppress
GET  /api/v1/consent-preferences/consents
POST /api/v1/consent-preferences/subjects/:id/consents
POST /api/v1/consent-preferences/consents/:id/withdraw
POST /api/v1/consent-preferences/consents/:id/expire
GET  /api/v1/consent-preferences/preferences
POST /api/v1/consent-preferences/subjects/:id/preferences
GET  /api/v1/consent-preferences/audit
GET  /api/v1/consent-preferences/metrics
```

## Seed

```powershell
npm run seed:consent-preferences
```
