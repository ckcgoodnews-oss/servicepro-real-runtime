---
title: "Sprint 126 - Data Residency and Localization"
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

# Sprint 126 - Data Residency and Localization

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

Apply this patch over Sprint 125.

## Endpoints to wire

```text
GET  /api/v1/data-residency/policies
POST /api/v1/data-residency/policies
GET  /api/v1/data-residency/assignments
POST /api/v1/data-residency/assignments
GET  /api/v1/data-residency/transfers
POST /api/v1/data-residency/transfers
POST /api/v1/data-residency/transfers/:id/evaluate
POST /api/v1/data-residency/transfers/:id/approve
POST /api/v1/data-residency/transfers/:id/reject
POST /api/v1/data-residency/transfers/:id/complete
GET  /api/v1/data-residency/requirements
POST /api/v1/data-residency/requirements
POST /api/v1/data-residency/requirements/:id/satisfy
GET  /api/v1/data-residency/violations
POST /api/v1/data-residency/violations
POST /api/v1/data-residency/violations/:id/remediate
POST /api/v1/data-residency/violations/:id/close
POST /api/v1/data-residency/transfers/:id/approvals
POST /api/v1/data-residency/approvals/:id/approve
POST /api/v1/data-residency/approvals/:id/reject
GET  /api/v1/data-residency/metrics
```

## Seed

```powershell
npm run seed:data-residency
```
