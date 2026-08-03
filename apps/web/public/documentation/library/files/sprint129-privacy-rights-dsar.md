---
title: "Sprint 129 - Privacy Rights and DSAR"
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

# Sprint 129 - Privacy Rights and DSAR

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

Apply this patch over Sprint 128.

## Endpoints to wire

```text
GET  /api/v1/privacy-rights/requests
POST /api/v1/privacy-rights/requests
POST /api/v1/privacy-rights/requests/:id/start-verification
POST /api/v1/privacy-rights/requests/:id/verifications
POST /api/v1/privacy-rights/verifications/:id/verify
POST /api/v1/privacy-rights/verifications/:id/fail
GET  /api/v1/privacy-rights/requests/:id/search-tasks
POST /api/v1/privacy-rights/requests/:id/search-tasks
POST /api/v1/privacy-rights/search-tasks/:id/start
POST /api/v1/privacy-rights/search-tasks/:id/complete
POST /api/v1/privacy-rights/requests/:id/packages
POST /api/v1/privacy-rights/packages/:id/ready
POST /api/v1/privacy-rights/packages/:id/approve
POST /api/v1/privacy-rights/requests/:id/approvals
POST /api/v1/privacy-rights/approvals/:id/approve
POST /api/v1/privacy-rights/approvals/:id/reject
POST /api/v1/privacy-rights/requests/:id/fulfillments
POST /api/v1/privacy-rights/fulfillments/:id/send
POST /api/v1/privacy-rights/fulfillments/:id/fail
POST /api/v1/privacy-rights/requests/:id/reject
GET  /api/v1/privacy-rights/metrics
```

## Seed

```powershell
npm run seed:privacy-rights
```
