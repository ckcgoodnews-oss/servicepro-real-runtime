---
title: "Sprint 100 - Production Hardening Runtime"
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

# Sprint 100 - Production Hardening Runtime

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

Apply this patch over Sprint 99.

## Endpoints to wire

```text
GET  /api/v1/operations/environments
POST /api/v1/operations/environments
GET  /api/v1/operations/releases
POST /api/v1/operations/releases
POST /api/v1/operations/releases/:id/approve
POST /api/v1/operations/releases/:id/deploy
POST /api/v1/operations/releases/:id/rollback
GET  /api/v1/operations/health-checks
POST /api/v1/operations/health-checks
POST /api/v1/operations/health-checks/defaults
POST /api/v1/operations/readiness
GET  /api/v1/operations/runbook
POST /api/v1/operations/runbook
```

## Seed

```powershell
npm run seed:operations
```

## Readiness

```powershell
npm run operations:readiness
```
