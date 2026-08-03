---
title: "Sprint 120 - Operational Risk Register"
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

# Sprint 120 - Operational Risk Register

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

Apply this patch over Sprint 119.

## Endpoints to wire

```text
GET  /api/v1/operational-risks
POST /api/v1/operational-risks
POST /api/v1/operational-risks/:id/close
GET  /api/v1/operational-risks/:id/mitigation-plans
POST /api/v1/operational-risks/:id/mitigation-plans
POST /api/v1/operational-risks/mitigation-plans/:id/complete
GET  /api/v1/operational-risks/:id/kris
POST /api/v1/operational-risks/:id/kris
POST /api/v1/operational-risks/kris/:id/value
GET  /api/v1/operational-risks/:id/reviews
POST /api/v1/operational-risks/:id/reviews
POST /api/v1/operational-risks/reviews/:id/complete
POST /api/v1/operational-risks/:id/acceptances
POST /api/v1/operational-risks/acceptances/:id/approve
POST /api/v1/operational-risks/acceptances/:id/reject
GET  /api/v1/operational-risks/metrics
```

## Seed

```powershell
npm run seed:operational-risks
```
