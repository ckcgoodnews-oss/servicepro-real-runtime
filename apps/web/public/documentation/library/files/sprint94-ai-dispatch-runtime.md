---
title: "Sprint 94 - AI Dispatch Runtime"
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

# Sprint 94 - AI Dispatch Runtime

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

Apply this patch over Sprint 93.

This sprint adds deterministic AI-assisted dispatch recommendation support. The scoring is explainable and auditable. It can later be replaced or augmented by ML without changing the dispatch workflow contract.

## Endpoints to wire

```text
GET  /api/v1/ai-dispatch/requests
POST /api/v1/ai-dispatch/requests

GET  /api/v1/ai-dispatch/recommendations
POST /api/v1/ai-dispatch/recommendations/generate
GET  /api/v1/ai-dispatch/recommendations/:id
POST /api/v1/ai-dispatch/recommendations/:id/accept
POST /api/v1/ai-dispatch/recommendations/:id/reject
```

## Seed

```powershell
npm run seed:ai-dispatch
```
