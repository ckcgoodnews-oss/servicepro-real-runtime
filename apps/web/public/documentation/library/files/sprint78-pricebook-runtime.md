---
title: "Sprint 78 - Price Book Runtime"
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

# Sprint 78 - Price Book Runtime

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

Apply this patch over Sprint 77.

## Endpoints to wire

```text
GET  /api/v1/pricebook/categories
POST /api/v1/pricebook/categories
GET  /api/v1/pricebook/items
POST /api/v1/pricebook/items
GET  /api/v1/pricebook/items/:id
PATCH /api/v1/pricebook/items/:id
POST /api/v1/pricebook/items/:id/line-preview
POST /api/v1/pricebook/publish
```

## Seed

```powershell
npm run seed:pricebook
```
