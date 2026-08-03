---
title: "Sprint 113 - Privacy Automation"
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

# Sprint 113 - Privacy Automation

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

Apply this patch over Sprint 112.

## Endpoints to wire

```text
GET  /api/v1/privacy/requests
POST /api/v1/privacy/requests
POST /api/v1/privacy/requests/:id/verify-identity
POST /api/v1/privacy/requests/:id/complete
POST /api/v1/privacy/requests/:id/reject
GET  /api/v1/privacy/consents
POST /api/v1/privacy/consents
POST /api/v1/privacy/consents/:id/withdraw
POST /api/v1/privacy/export-jobs
POST /api/v1/privacy/export-jobs/:id/start
POST /api/v1/privacy/export-jobs/:id/complete
POST /api/v1/privacy/redaction-tasks
POST /api/v1/privacy/redaction-tasks/:id/complete
POST /api/v1/privacy/erasure-approvals
POST /api/v1/privacy/erasure-approvals/:id/approve
POST /api/v1/privacy/erasure-approvals/:id/reject
GET  /api/v1/privacy/requests/:id/audit
GET  /api/v1/privacy/summary
```

## Seed

```powershell
npm run seed:privacy
```
