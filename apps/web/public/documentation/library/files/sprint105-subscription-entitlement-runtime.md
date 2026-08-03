---
title: "Sprint 105 - Subscription and Entitlement Runtime"
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

# Sprint 105 - Subscription and Entitlement Runtime

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

Apply this patch over Sprint 104.

## Endpoints to wire

```text
GET  /api/v1/subscription/plans
POST /api/v1/subscription/plans
GET  /api/v1/subscription/plans/:id/entitlements
POST /api/v1/subscription/plans/:id/entitlements

GET  /api/v1/subscription/subscriptions
POST /api/v1/subscription/subscriptions
POST /api/v1/subscription/entitlements/evaluate

GET  /api/v1/subscription/meters
POST /api/v1/subscription/meters
POST /api/v1/subscription/usage
POST /api/v1/subscription/usage/aggregate

GET  /api/v1/subscription/invoices
POST /api/v1/subscription/invoices
POST /api/v1/subscription/invoices/generate
POST /api/v1/subscription/invoices/:id/pay
```

## Seed

```powershell
npm run seed:subscription
```
