---
title: "Sprint 147 - Customer Success and Onboarding"
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

# Sprint 147 - Customer Success and Onboarding

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

Apply this patch over Sprint 146.

## Endpoints to wire

```text
POST /api/v1/customer-success/cohorts
POST /api/v1/customer-success/cohorts/:id/activate
POST /api/v1/customer-success/cohorts/:id/complete
POST /api/v1/customer-success/plans
POST /api/v1/customer-success/plans/:id/start
POST /api/v1/customer-success/plans/:id/complete
POST /api/v1/customer-success/plans/:id/block
POST /api/v1/customer-success/plans/:id/tasks
POST /api/v1/customer-success/tasks/:id/start
POST /api/v1/customer-success/tasks/:id/complete
POST /api/v1/customer-success/adoption-metrics
POST /api/v1/customer-success/feedback
POST /api/v1/customer-success/feedback/:id/review
POST /api/v1/customer-success/feedback/:id/resolve
POST /api/v1/customer-success/escalations
POST /api/v1/customer-success/escalations/:id/start
POST /api/v1/customer-success/escalations/:id/resolve
POST /api/v1/customer-success/escalations/:id/close
POST /api/v1/customer-success/success-plans
POST /api/v1/customer-success/success-plans/:id/activate
POST /api/v1/customer-success/success-plans/:id/at-risk
GET  /api/v1/customer-success/metrics
```

## Seed

```powershell
npm run seed:customer-success
```
