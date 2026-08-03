---
title: "Sprint 149 - Finance Operations and Revenue Recognition"
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

# Sprint 149 - Finance Operations and Revenue Recognition

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

Apply this patch over Sprint 148.

## Endpoints to wire

```text
POST /api/v1/finance/periods
POST /api/v1/finance/periods/:id/lock
POST /api/v1/finance/periods/:id/close
POST /api/v1/finance/revenue-schedules
POST /api/v1/finance/revenue-schedules/:id/activate
POST /api/v1/finance/revenue-schedules/:id/recognize
POST /api/v1/finance/tax-profiles
POST /api/v1/finance/tax-profiles/:id/validate
POST /api/v1/finance/refunds
POST /api/v1/finance/refunds/:id/approve
POST /api/v1/finance/refunds/:id/process
POST /api/v1/finance/payouts
POST /api/v1/finance/payouts/:id/approve
POST /api/v1/finance/payouts/:id/pay
POST /api/v1/finance/ledger
POST /api/v1/finance/ledger/:id/post
POST /api/v1/finance/reconciliations
POST /api/v1/finance/reconciliations/:id/start
POST /api/v1/finance/reconciliations/:id/complete
GET  /api/v1/finance/ledger-balanced
GET  /api/v1/finance/metrics
```

## Seed

```powershell
npm run seed:finance
```
