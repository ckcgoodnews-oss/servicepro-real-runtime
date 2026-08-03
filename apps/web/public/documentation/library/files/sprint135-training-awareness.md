---
title: "Sprint 135 - Training and Awareness"
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

# Sprint 135 - Training and Awareness

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

Apply this patch over Sprint 134.

## Endpoints to wire

```text
GET  /api/v1/training-awareness/courses
POST /api/v1/training-awareness/courses
GET  /api/v1/training-awareness/campaigns
POST /api/v1/training-awareness/campaigns
POST /api/v1/training-awareness/campaigns/:id/schedule
POST /api/v1/training-awareness/campaigns/:id/activate
GET  /api/v1/training-awareness/assignments
POST /api/v1/training-awareness/assignments
POST /api/v1/training-awareness/assignments/:id/start
POST /api/v1/training-awareness/assignments/:id/evidence
POST /api/v1/training-awareness/assignments/:id/complete
POST /api/v1/training-awareness/assignments/mark-overdue
POST /api/v1/training-awareness/assignments/:id/reminders
POST /api/v1/training-awareness/reminders/:id/send
POST /api/v1/training-awareness/reminders/:id/fail
POST /api/v1/training-awareness/assignments/:id/exceptions
POST /api/v1/training-awareness/exceptions/:id/approve
POST /api/v1/training-awareness/exceptions/:id/reject
GET  /api/v1/training-awareness/metrics
```

## Seed

```powershell
npm run seed:training-awareness
```
