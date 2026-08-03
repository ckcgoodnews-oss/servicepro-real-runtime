---
title: "Sprint 133 - AI Governance and Model Risk Management"
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

# Sprint 133 - AI Governance and Model Risk Management

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

Apply this patch over Sprint 132.

## Endpoints to wire

```text
GET  /api/v1/ai-governance/systems
POST /api/v1/ai-governance/systems
POST /api/v1/ai-governance/systems/:id/activate
POST /api/v1/ai-governance/systems/:id/pause
POST /api/v1/ai-governance/systems/:id/review
GET  /api/v1/ai-governance/assessments
POST /api/v1/ai-governance/systems/:id/assessments
POST /api/v1/ai-governance/assessments/:id/submit
POST /api/v1/ai-governance/assessments/:id/approve
POST /api/v1/ai-governance/assessments/:id/require-mitigation
POST /api/v1/ai-governance/assessments/:id/approvals
POST /api/v1/ai-governance/approvals/:id/approve
POST /api/v1/ai-governance/approvals/:id/reject
GET  /api/v1/ai-governance/systems/:id/signals
POST /api/v1/ai-governance/systems/:id/signals
GET  /api/v1/ai-governance/incidents
POST /api/v1/ai-governance/systems/:id/incidents
POST /api/v1/ai-governance/incidents/:id/mitigate
POST /api/v1/ai-governance/incidents/:id/close
GET  /api/v1/ai-governance/metrics
```

## Seed

```powershell
npm run seed:ai-governance
```
