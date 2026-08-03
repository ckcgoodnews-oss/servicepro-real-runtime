---
title: "Sprint 110 - Contract Management Runtime"
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

# Sprint 110 - Contract Management Runtime

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

Apply this patch over Sprint 109.

## Endpoints to wire

```text
GET  /api/v1/contracts/agreements
POST /api/v1/contracts/agreements
POST /api/v1/contracts/agreements/:id/activate
POST /api/v1/contracts/agreements/:id/terminate
POST /api/v1/contracts/agreements/:id/renewal-window
GET  /api/v1/contracts/agreements/:id/value
GET  /api/v1/contracts/agreements/:id/order-forms
POST /api/v1/contracts/agreements/:id/order-forms
GET  /api/v1/contracts/agreements/:id/terms
POST /api/v1/contracts/agreements/:id/terms
GET  /api/v1/contracts/agreements/:id/amendments
POST /api/v1/contracts/agreements/:id/amendments
POST /api/v1/contracts/amendments/:id/execute
GET  /api/v1/contracts/obligations
POST /api/v1/contracts/obligations
POST /api/v1/contracts/obligations/:id/fulfill
GET  /api/v1/contracts/portfolio
```

## Seed

```powershell
npm run seed:contracts
```
