---
title: "Sprint 131 - Processing Inventory and DPIA"
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

# Sprint 131 - Processing Inventory and DPIA

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

Apply this patch over Sprint 130.

## Endpoints to wire

```text
GET  /api/v1/processing-inventory/activities
POST /api/v1/processing-inventory/activities
POST /api/v1/processing-inventory/activities/:id/review
GET  /api/v1/processing-inventory/activities/:id/data-categories
POST /api/v1/processing-inventory/activities/:id/data-categories
GET  /api/v1/processing-inventory/activities/:id/system-mappings
POST /api/v1/processing-inventory/activities/:id/system-mappings
GET  /api/v1/processing-inventory/dpias
POST /api/v1/processing-inventory/activities/:id/dpias
POST /api/v1/processing-inventory/dpias/:id/submit
POST /api/v1/processing-inventory/dpias/:id/decisions
GET  /api/v1/processing-inventory/tasks
POST /api/v1/processing-inventory/dpias/:id/tasks
POST /api/v1/processing-inventory/tasks/:id/complete
GET  /api/v1/processing-inventory/metrics
```

## Seed

```powershell
npm run seed:processing-inventory
```
