---
title: "Sprint 64 - Notifications Runtime"
subtitle: "What changed"
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

# Sprint 64 - Notifications Runtime

> **Sprint documentation**
> What changed

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 63.

## What changed

- Added message templates.
- Added notification queue.
- Added template rendering.
- Added notification process script.
- Added notification RBAC permissions.
- Added JSON and PostgreSQL repositories.

## Endpoints

```text
GET  /api/v1/notifications/templates
POST /api/v1/notifications/templates
GET  /api/v1/notifications
POST /api/v1/notifications
POST /api/v1/notifications/process
```

## Example queue body

```json
{
  "templateKey": "booking_requested",
  "toAddress": "customer@example.com",
  "toName": "Maria Johnson",
  "data": {
    "customerName": "Maria",
    "serviceType": "Drain cleaning",
    "requestedDate": "2026-07-10"
  }
}
```

Process queued notifications:

```powershell
npm run notifications:process
```
