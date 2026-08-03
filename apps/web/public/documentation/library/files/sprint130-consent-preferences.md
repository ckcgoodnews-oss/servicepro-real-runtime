---
title: "Sprint 130 - Consent and Preference Management"
subtitle: "Endpoints to wire"
document_type: "Sprint documentation"
audience:
  - Business leaders
  - Platform administrators
  - Buyers and evaluators
  - Partners and technical stakeholders
status: "Publication edition"
published: "2026-08-03"
source_of_truth: "ServicePro repository"
---

# Sprint 130 - Consent and Preference Management

> **Sprint documentation**
> Endpoints to wire

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

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
