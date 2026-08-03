---
title: "Sprint 96 - Customer Communication Center 2.0 Runtime"
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

# Sprint 96 - Customer Communication Center 2.0 Runtime

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

Apply this patch over Sprint 95.

## Endpoints to wire

```text
GET   /api/v1/communication-center/threads
POST  /api/v1/communication-center/threads
GET   /api/v1/communication-center/threads/:id
PATCH /api/v1/communication-center/threads/:id

GET   /api/v1/communication-center/threads/:id/messages
POST  /api/v1/communication-center/threads/:id/messages

POST  /api/v1/communication-center/threads/:id/assign
POST  /api/v1/communication-center/threads/:id/mark-read
POST  /api/v1/communication-center/threads/:id/resolve
POST  /api/v1/communication-center/summary
```

## Seed

```powershell
npm run seed:communication-center
```
