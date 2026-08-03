---
title: "Sprint 92 - Customer Surveys Runtime"
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

# Sprint 92 - Customer Surveys Runtime

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

Apply this patch over Sprint 91.

## Endpoints to wire

```text
GET  /api/v1/surveys/templates
POST /api/v1/surveys/templates

GET  /api/v1/surveys/sends
POST /api/v1/surveys/sends
POST /api/v1/surveys/sends/:id/mark-sent

GET  /api/v1/surveys/responses
POST /api/v1/surveys/responses
POST /api/v1/surveys/summary
```

## Seed

```powershell
npm run seed:surveys
```
