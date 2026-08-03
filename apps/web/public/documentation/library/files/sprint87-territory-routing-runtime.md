---
title: "Sprint 87 - Territory Routing Runtime"
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

# Sprint 87 - Territory Routing Runtime

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

Apply this patch over Sprint 86.

## Endpoints to wire

```text
GET  /api/v1/territories
POST /api/v1/territories
POST /api/v1/territories/match

GET  /api/v1/territory-rules
POST /api/v1/territory-rules
GET  /api/v1/territories/:id/rules
POST /api/v1/territories/:id/rules

GET  /api/v1/technician-territories
POST /api/v1/technician-territories
GET  /api/v1/territories/:id/technicians
POST /api/v1/territories/:id/technicians
```

## Seed

```powershell
npm run seed:territories
```
