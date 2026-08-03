---
title: "Sprint 97 - Technician Mobile Offline Sync Runtime"
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

# Sprint 97 - Technician Mobile Offline Sync Runtime

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

Apply this patch over Sprint 96.

## Endpoints to wire

```text
GET  /api/v1/mobile-sync/devices
POST /api/v1/mobile-sync/devices
POST /api/v1/mobile-sync/devices/:id/heartbeat

GET  /api/v1/mobile-sync/devices/:deviceId/cursor
POST /api/v1/mobile-sync/push
POST /api/v1/mobile-sync/pull

GET  /api/v1/mobile-sync/changes
POST /api/v1/mobile-sync/changes/:id/resolve
```

## Seed

```powershell
npm run seed:mobile-sync
```
