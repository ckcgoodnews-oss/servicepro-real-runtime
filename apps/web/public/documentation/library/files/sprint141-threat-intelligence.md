---
title: "Sprint 141 - Threat Intelligence"
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

# Sprint 141 - Threat Intelligence

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
