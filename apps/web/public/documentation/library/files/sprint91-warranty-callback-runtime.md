---
title: "Sprint 91 - Warranty and Callback Runtime"
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

# Sprint 91 - Warranty and Callback Runtime

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

Apply this patch over Sprint 90.

## Endpoints to wire

```text
GET  /api/v1/warranty/policies
POST /api/v1/warranty/policies

GET  /api/v1/warranty/claims
POST /api/v1/warranty/claims
POST /api/v1/warranty/claims/evaluate
POST /api/v1/warranty/claims/:id/approve
POST /api/v1/warranty/claims/:id/deny

GET  /api/v1/callbacks
POST /api/v1/callbacks
POST /api/v1/callbacks/:id/complete
```

## Seed

```powershell
npm run seed:warranty
```
