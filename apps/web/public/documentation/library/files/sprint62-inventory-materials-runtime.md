---
title: "Sprint 62 - Inventory and Material Usage Runtime"
subtitle: "What changed"
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

# Sprint 62 - Inventory and Material Usage Runtime

> **Sprint documentation**
> What changed

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 61.

## What changed

- Added inventory item CRUD.
- Added stock adjustments.
- Added job material usage.
- Material usage deducts stock.
- Added inventory/material RBAC permissions.
- Added JSON and PostgreSQL repositories.
- Added PostgreSQL migration.

## Endpoints

```text
GET    /api/v1/inventory
POST   /api/v1/inventory
GET    /api/v1/inventory/:id
PATCH  /api/v1/inventory/:id
POST   /api/v1/inventory/:id/adjust
DELETE /api/v1/inventory/:id

GET    /api/v1/materials
POST   /api/v1/materials
```

## Example material usage

```json
{
  "jobId": "job_demo_1",
  "inventoryItemId": "item_demo_1",
  "quantity": 2,
  "notes": "Used under kitchen sink"
}
```
