---
title: "Sprint 106 - Marketplace and Integration Runtime"
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

# Sprint 106 - Marketplace and Integration Runtime

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

Apply this patch over Sprint 105.

## Endpoints to wire

```text
GET  /api/v1/marketplace/catalog
POST /api/v1/marketplace/catalog
GET  /api/v1/marketplace/installations
POST /api/v1/marketplace/installations
POST /api/v1/marketplace/installations/:id/connect
POST /api/v1/marketplace/installations/:id/fail
GET  /api/v1/marketplace/installations/:id/health

GET  /api/v1/marketplace/webhooks
POST /api/v1/marketplace/webhooks
GET  /api/v1/marketplace/sync-runs
POST /api/v1/marketplace/sync-runs
POST /api/v1/marketplace/sync-runs/:id/start
POST /api/v1/marketplace/sync-runs/:id/complete

GET  /api/v1/marketplace/summary
```

## Seed

```powershell
npm run seed:marketplace
```
