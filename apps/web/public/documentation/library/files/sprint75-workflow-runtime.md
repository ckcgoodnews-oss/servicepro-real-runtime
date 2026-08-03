---
title: "Sprint 75 - Workflow Runtime"
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

# Sprint 75 - Workflow Runtime

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

Apply this patch over Sprint 74.

## Added

- Job lifecycle workflow rules
- Workflow transition validation
- Workflow events
- Job transition route
- Workflow seed helper

## Endpoints

```text
GET  /api/v1/workflows
POST /api/v1/workflows
GET  /api/v1/workflow-events

POST /api/v1/jobs/:id/transition
```

## Example transition body

```json
{
  "status": "scheduled",
  "notes": "Customer confirmed appointment"
}
```

## Seed command

```powershell
npm run seed:workflow
```
