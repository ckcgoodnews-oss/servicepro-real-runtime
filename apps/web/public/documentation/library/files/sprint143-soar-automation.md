---
title: "Sprint 143 - SOAR Automation"
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

# Sprint 143 - SOAR Automation

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

Apply this patch over Sprint 142.

## Endpoints to wire

```text
GET  /api/v1/soar/playbooks
POST /api/v1/soar/playbooks
POST /api/v1/soar/playbooks/:id/activate
POST /api/v1/soar/playbooks/:id/disable
GET  /api/v1/soar/playbooks/:id/steps
POST /api/v1/soar/playbooks/:id/steps
GET  /api/v1/soar/connectors
POST /api/v1/soar/connectors
POST /api/v1/soar/cases
POST /api/v1/soar/cases/:id/close
POST /api/v1/soar/runs
POST /api/v1/soar/runs/:id/start
POST /api/v1/soar/runs/:id/wait-approval
POST /api/v1/soar/runs/:id/complete
POST /api/v1/soar/runs/:id/fail
POST /api/v1/soar/runs/:id/rollback
POST /api/v1/soar/approvals
POST /api/v1/soar/approvals/:id/approve
POST /api/v1/soar/approvals/:id/reject
GET  /api/v1/soar/runs/:id/logs
POST /api/v1/soar/runs/:id/logs
GET  /api/v1/soar/metrics
```

## Seed

```powershell
npm run seed:soar
```
