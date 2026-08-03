---
title: "Sprint 151 - Privacy Operations and Data Subject Rights"
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

# Sprint 151 - Privacy Operations and Data Subject Rights

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

Apply this patch over Sprint 150.

## Endpoints to wire

```text
POST /api/v1/privacy/dsars
POST /api/v1/privacy/dsars/:id/verify
POST /api/v1/privacy/dsars/:id/fulfill
POST /api/v1/privacy/dsars/:id/deny
POST /api/v1/privacy/consents
POST /api/v1/privacy/consents/:id/withdraw
POST /api/v1/privacy/retention-policies
POST /api/v1/privacy/retention-policies/:id/activate
POST /api/v1/privacy/retention-policies/:id/retire
POST /api/v1/privacy/deletion-jobs
POST /api/v1/privacy/deletion-jobs/:id/start
POST /api/v1/privacy/deletion-jobs/:id/complete
POST /api/v1/privacy/deletion-jobs/:id/fail
POST /api/v1/privacy/processing-activities
POST /api/v1/privacy/processing-activities/:id/activate
POST /api/v1/privacy/processing-activities/:id/retire
POST /api/v1/privacy/dpias
POST /api/v1/privacy/dpias/:id/review
POST /api/v1/privacy/dpias/:id/approve
POST /api/v1/privacy/dpias/:id/reject
POST /api/v1/privacy/breaches
POST /api/v1/privacy/breaches/:id/confirm
POST /api/v1/privacy/breaches/:id/report
POST /api/v1/privacy/breaches/:id/notify-subjects
POST /api/v1/privacy/breaches/:id/close
GET  /api/v1/privacy/metrics
```

## Seed

```powershell
npm run seed:privacy
```
