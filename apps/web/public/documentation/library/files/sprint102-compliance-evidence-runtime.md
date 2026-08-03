---
title: "Sprint 102 - Compliance Evidence Runtime"
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

# Sprint 102 - Compliance Evidence Runtime

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

Apply this patch over Sprint 101.

## Endpoints to wire

```text
GET  /api/v1/compliance/frameworks
POST /api/v1/compliance/frameworks
GET  /api/v1/compliance/controls
POST /api/v1/compliance/controls
GET  /api/v1/compliance/packages
POST /api/v1/compliance/packages
GET  /api/v1/compliance/evidence
POST /api/v1/compliance/evidence
POST /api/v1/compliance/evidence/:id/review
GET  /api/v1/compliance/mappings
POST /api/v1/compliance/mappings
POST /api/v1/compliance/attestations
POST /api/v1/compliance/attestations/:id/approve
POST /api/v1/compliance/exports
POST /api/v1/compliance/exports/:id/complete
POST /api/v1/compliance/score
```

## Seed

```powershell
npm run seed:compliance
```
