---
title: "Sprint 128 - Data Retention and Records Lifecycle"
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

# Sprint 128 - Data Retention and Records Lifecycle

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

Apply this patch over Sprint 127.

## Endpoints to wire

```text
GET  /api/v1/data-retention/policies
POST /api/v1/data-retention/policies
GET  /api/v1/data-retention/record-classes
POST /api/v1/data-retention/record-classes
GET  /api/v1/data-retention/schedules
POST /api/v1/data-retention/schedules
POST /api/v1/data-retention/schedules/:id/eligible
POST /api/v1/data-retention/schedules/:id/block-hold
POST /api/v1/data-retention/schedules/:id/unblock-hold
POST /api/v1/data-retention/schedules/:id/reviews
POST /api/v1/data-retention/reviews/:id/approve
POST /api/v1/data-retention/reviews/:id/reject
POST /api/v1/data-retention/schedules/:id/dispose
POST /api/v1/data-retention/deletion-jobs
POST /api/v1/data-retention/deletion-jobs/:id/start
POST /api/v1/data-retention/deletion-jobs/:id/complete
GET  /api/v1/data-retention/metrics
```

## Seed

```powershell
npm run seed:data-retention
```
