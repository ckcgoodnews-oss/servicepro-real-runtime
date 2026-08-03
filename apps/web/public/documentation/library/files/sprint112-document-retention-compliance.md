---
title: "Sprint 112 - Document Retention and Compliance"
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

# Sprint 112 - Document Retention and Compliance

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

Apply this patch over Sprint 111.

## Endpoints to wire

```text
GET  /api/v1/retention/policies
POST /api/v1/retention/policies
GET  /api/v1/retention/classifications
POST /api/v1/retention/classifications
GET  /api/v1/retention/legal-holds
POST /api/v1/retention/legal-holds
POST /api/v1/retention/legal-holds/:id/release
GET  /api/v1/retention/reviews
POST /api/v1/retention/reviews
POST /api/v1/retention/reviews/:id/approve
POST /api/v1/retention/reviews/:id/reject
POST /api/v1/retention/reviews/:id/delete
POST /api/v1/retention/export-jobs
POST /api/v1/retention/export-jobs/:id/start
POST /api/v1/retention/export-jobs/:id/complete
GET  /api/v1/retention/summary
```

## Seed

```powershell
npm run seed:retention
```
