---
title: "Sprint 109 - Customer Success Runtime"
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

# Sprint 109 - Customer Success Runtime

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

Apply this patch over Sprint 108.

## Endpoints to wire

```text
GET  /api/v1/customer-success/account-plans
POST /api/v1/customer-success/account-plans
GET  /api/v1/customer-success/account-plans/:id/milestones
POST /api/v1/customer-success/account-plans/:id/milestones
POST /api/v1/customer-success/milestones/:id/complete

GET  /api/v1/customer-success/tasks
POST /api/v1/customer-success/tasks
POST /api/v1/customer-success/tasks/:id/complete

GET  /api/v1/customer-success/account-plans/:id/qbrs
POST /api/v1/customer-success/account-plans/:id/qbrs
POST /api/v1/customer-success/qbrs/:id/complete

GET  /api/v1/customer-success/account-plans/:id/renewal-risks
POST /api/v1/customer-success/account-plans/:id/renewal-risks
POST /api/v1/customer-success/renewal-risks/:id/resolve

GET  /api/v1/customer-success/account-plans/:id/score
```

## Seed

```powershell
npm run seed:customer-success
```
