---
title: "Sprint 84 - Reminders Runtime"
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

# Sprint 84 - Reminders Runtime

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

Apply this patch over Sprint 83.

## Endpoints to wire

```text
GET   /api/v1/reminder-rules
POST  /api/v1/reminder-rules

GET   /api/v1/follow-ups
POST  /api/v1/follow-ups
POST  /api/v1/follow-ups/timeline
POST  /api/v1/follow-ups/due
POST  /api/v1/follow-ups/overdue
GET   /api/v1/follow-ups/:id
PATCH /api/v1/follow-ups/:id
POST  /api/v1/follow-ups/:id/complete
POST  /api/v1/follow-ups/:id/snooze
```

## Seed

```powershell
npm run seed:reminders
```
