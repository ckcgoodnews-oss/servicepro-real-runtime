---
title: "Sprint 137 - BCDR Governance"
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

# Sprint 137 - BCDR Governance

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

Apply this patch over Sprint 136.

## Endpoints to wire

```text
GET  /api/v1/bcdr/bias
POST /api/v1/bcdr/bias
POST /api/v1/bcdr/bias/:id/submit
POST /api/v1/bcdr/bias/:id/approve
GET  /api/v1/bcdr/plans
POST /api/v1/bcdr/bias/:id/plans
POST /api/v1/bcdr/plans/:id/submit
POST /api/v1/bcdr/plans/:id/approve
POST /api/v1/bcdr/plans/:id/activate
POST /api/v1/bcdr/plans/:id/approvals
POST /api/v1/bcdr/approvals/:id/approve
POST /api/v1/bcdr/approvals/:id/reject
POST /api/v1/bcdr/plans/:id/exercises
POST /api/v1/bcdr/exercises/:id/start
POST /api/v1/bcdr/exercises/:id/complete
GET  /api/v1/bcdr/exercises/:id/evidence
POST /api/v1/bcdr/exercises/:id/evidence
POST /api/v1/bcdr/plans/:id/gaps
POST /api/v1/bcdr/gaps/:id/complete
POST /api/v1/bcdr/gaps/:id/accept-risk
GET  /api/v1/bcdr/metrics
```

## Seed

```powershell
npm run seed:bcdr
```
