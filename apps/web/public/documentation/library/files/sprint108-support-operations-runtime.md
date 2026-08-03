---
title: "Sprint 108 - Support Operations Runtime"
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

# Sprint 108 - Support Operations Runtime

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

Apply this patch over Sprint 107.

## Endpoints to wire

```text
GET  /api/v1/support/slas
POST /api/v1/support/slas
GET  /api/v1/support/tickets
POST /api/v1/support/tickets
POST /api/v1/support/tickets/:id/transition
POST /api/v1/support/tickets/:id/first-response
POST /api/v1/support/tickets/:id/evaluate-sla
GET  /api/v1/support/tickets/:id/comments
POST /api/v1/support/tickets/:id/comments
GET  /api/v1/support/escalations
POST /api/v1/support/escalations
POST /api/v1/support/escalations/:id/acknowledge
POST /api/v1/support/escalations/:id/resolve
GET  /api/v1/support/articles
POST /api/v1/support/articles
POST /api/v1/support/health-signals
GET  /api/v1/support/customer-health/:tenantId
```

## Seed

```powershell
npm run seed:support
```
