---
title: "Sprint 95 - Predictive Maintenance Runtime"
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

# Sprint 95 - Predictive Maintenance Runtime

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

Apply this patch over Sprint 94.

## Endpoints to wire

```text
GET  /api/v1/predictive-maintenance/models
POST /api/v1/predictive-maintenance/models

GET  /api/v1/predictive-maintenance/predictions
POST /api/v1/predictive-maintenance/predictions/generate
GET  /api/v1/predictive-maintenance/predictions/:id
POST /api/v1/predictive-maintenance/predictions/:id/convert
POST /api/v1/predictive-maintenance/predictions/:id/dismiss
```

## Seed

```powershell
npm run seed:predictive-maintenance
```
