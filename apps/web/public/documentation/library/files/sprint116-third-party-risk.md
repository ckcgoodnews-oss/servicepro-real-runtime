---
title: "Sprint 116 - Third-Party Risk Management"
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

# Sprint 116 - Third-Party Risk Management

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

Apply this patch over Sprint 115.

## Endpoints to wire

```text
GET  /api/v1/third-party-risk/vendors
POST /api/v1/third-party-risk/vendors
GET  /api/v1/third-party-risk/vendors/:id/assessments
POST /api/v1/third-party-risk/vendors/:id/assessments
POST /api/v1/third-party-risk/assessments/:id/complete
GET  /api/v1/third-party-risk/assessments/:id/responses
POST /api/v1/third-party-risk/assessments/:id/responses
GET  /api/v1/third-party-risk/findings
POST /api/v1/third-party-risk/vendors/:id/findings
POST /api/v1/third-party-risk/findings/:id/transition
GET  /api/v1/third-party-risk/findings/:id/remediation-tasks
POST /api/v1/third-party-risk/findings/:id/remediation-tasks
POST /api/v1/third-party-risk/remediation-tasks/:id/complete
POST /api/v1/third-party-risk/findings/:id/exceptions
POST /api/v1/third-party-risk/exceptions/:id/approve
POST /api/v1/third-party-risk/exceptions/:id/reject
GET  /api/v1/third-party-risk/vendors/:id/risk
GET  /api/v1/third-party-risk/metrics
```

## Seed

```powershell
npm run seed:third-party-risk
```
