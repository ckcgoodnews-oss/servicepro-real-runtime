---
title: "Sprint 124 - Customer Security Questionnaires"
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

# Sprint 124 - Customer Security Questionnaires

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

Apply this patch over Sprint 123.

## Endpoints to wire

```text
GET  /api/v1/security-questionnaires
POST /api/v1/security-questionnaires
GET  /api/v1/security-questionnaires/:id/questions
POST /api/v1/security-questionnaires/:id/questions
POST /api/v1/security-questionnaires/questions/:id/approve
POST /api/v1/security-questionnaires/questions/:id/reject
GET  /api/v1/security-questionnaires/answers
POST /api/v1/security-questionnaires/answers
POST /api/v1/security-questionnaires/:id/submit-review
POST /api/v1/security-questionnaires/:id/reviews
POST /api/v1/security-questionnaires/reviews/:id/approve
POST /api/v1/security-questionnaires/reviews/:id/reject
POST /api/v1/security-questionnaires/:id/mark-sent
POST /api/v1/security-questionnaires/:id/exports
POST /api/v1/security-questionnaires/exports/:id/start
POST /api/v1/security-questionnaires/exports/:id/complete
GET  /api/v1/security-questionnaires/metrics
```

## Seed

```powershell
npm run seed:security-questionnaires
```
