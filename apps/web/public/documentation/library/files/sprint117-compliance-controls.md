---
title: "Sprint 117 - Compliance Control Mapping"
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

# Sprint 117 - Compliance Control Mapping

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

Apply this patch over Sprint 116.

## Endpoints to wire

```text
GET  /api/v1/compliance-controls/frameworks
POST /api/v1/compliance-controls/frameworks
GET  /api/v1/compliance-controls/controls
POST /api/v1/compliance-controls/frameworks/:id/controls
GET  /api/v1/compliance-controls/controls/:id/evidence
POST /api/v1/compliance-controls/controls/:id/evidence
GET  /api/v1/compliance-controls/controls/:id/test-runs
POST /api/v1/compliance-controls/controls/:id/test-runs
POST /api/v1/compliance-controls/test-runs/:id/start
POST /api/v1/compliance-controls/test-runs/:id/complete
GET  /api/v1/compliance-controls/gaps
POST /api/v1/compliance-controls/controls/:id/gaps
POST /api/v1/compliance-controls/gaps/:id/close
POST /api/v1/compliance-controls/gaps/:id/accept
GET  /api/v1/compliance-controls/gaps/:id/corrective-actions
POST /api/v1/compliance-controls/gaps/:id/corrective-actions
POST /api/v1/compliance-controls/corrective-actions/:id/complete
GET  /api/v1/compliance-controls/coverage
```

## Seed

```powershell
npm run seed:compliance-controls
```
