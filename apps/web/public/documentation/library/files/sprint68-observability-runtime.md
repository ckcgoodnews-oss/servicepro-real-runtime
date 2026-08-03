---
title: "Sprint 68 - Observability Runtime"
subtitle: "Added"
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

# Sprint 68 - Observability Runtime

> **Sprint documentation**
> Added

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 67.

## Added

- Request IDs via `x-request-id`.
- Structured JSON logging.
- Request metrics.
- Enhanced health/readiness payloads.
- Observability endpoints.

## Endpoints

```text
GET /healthz
GET /readyz
GET /api/v1/observability/metrics
GET /api/v1/observability/summary
```
