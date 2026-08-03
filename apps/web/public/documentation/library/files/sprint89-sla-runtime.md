---
title: "Sprint 89 - SLA Runtime"
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

# Sprint 89 - SLA Runtime

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

Apply this patch over Sprint 88.

## Endpoints to wire

```text
GET  /api/v1/sla/policies
POST /api/v1/sla/policies

GET  /api/v1/sla/timers
POST /api/v1/sla/timers
POST /api/v1/sla/policies/:policyId/start

POST /api/v1/sla/timers/:id/responded
POST /api/v1/sla/timers/:id/resolved
POST /api/v1/sla/evaluate
POST /api/v1/sla/mark-breaches
```

## Seed

```powershell
npm run seed:sla
```
