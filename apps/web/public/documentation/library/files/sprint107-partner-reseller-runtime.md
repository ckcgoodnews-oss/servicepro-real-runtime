---
title: "Sprint 107 - Partner and Reseller Runtime"
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

# Sprint 107 - Partner and Reseller Runtime

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

Apply this patch over Sprint 106.

## Endpoints to wire

```text
GET  /api/v1/partners
POST /api/v1/partners
GET  /api/v1/partners/reseller-tenants
POST /api/v1/partners/reseller-tenants
GET  /api/v1/partners/referrals
POST /api/v1/partners/referrals
POST /api/v1/partners/referrals/:id/accept
POST /api/v1/partners/referrals/:id/won
GET  /api/v1/partners/commission-rules
POST /api/v1/partners/commission-rules
GET  /api/v1/partners/commissions
POST /api/v1/partners/commissions
POST /api/v1/partners/commissions/:id/approve
POST /api/v1/partners/payouts
POST /api/v1/partners/payouts/:id/approve
POST /api/v1/partners/payouts/:id/pay
GET  /api/v1/partners/:id/performance
```

## Seed

```powershell
npm run seed:partners
```
