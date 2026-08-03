---
title: "Sprint 138 - Asset Inventory and Configuration Compliance"
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

# Sprint 138 - Asset Inventory and Configuration Compliance

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
