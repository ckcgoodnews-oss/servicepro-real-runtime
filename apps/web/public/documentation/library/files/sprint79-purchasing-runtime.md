---
title: "Sprint 79 - Purchasing Runtime"
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

# Sprint 79 - Purchasing Runtime

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

Apply this patch over Sprint 78.

## Endpoints to wire

```text
GET   /api/v1/vendors
POST  /api/v1/vendors
GET   /api/v1/vendors/:id
PATCH /api/v1/vendors/:id

GET   /api/v1/purchase-orders
POST  /api/v1/purchase-orders
GET   /api/v1/purchase-orders/:id
PATCH /api/v1/purchase-orders/:id
POST  /api/v1/purchase-orders/:id/receive
GET   /api/v1/purchase-orders/:id/receipts
```

## Seed

```powershell
npm run seed:purchasing
```
