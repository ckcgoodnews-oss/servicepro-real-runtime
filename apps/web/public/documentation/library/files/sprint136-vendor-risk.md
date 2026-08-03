---
title: "Sprint 136 - Third-Party Vendor Risk"
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

# Sprint 136 - Third-Party Vendor Risk

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

Apply this patch over Sprint 135.

## Endpoints to wire

```text
GET  /api/v1/vendor-risk/vendors
POST /api/v1/vendor-risk/vendors
POST /api/v1/vendor-risk/vendors/:id/activate
POST /api/v1/vendor-risk/vendors/:id/suspend
GET  /api/v1/vendor-risk/vendors/:id/services
POST /api/v1/vendor-risk/vendors/:id/services
GET  /api/v1/vendor-risk/assessments
POST /api/v1/vendor-risk/vendors/:id/assessments
POST /api/v1/vendor-risk/assessments/:id/submit
POST /api/v1/vendor-risk/assessments/:id/approve
POST /api/v1/vendor-risk/assessments/:id/require-remediation
POST /api/v1/vendor-risk/vendors/:id/attestations
POST /api/v1/vendor-risk/attestations/:id/receive
POST /api/v1/vendor-risk/attestations/:id/accept
POST /api/v1/vendor-risk/attestations/:id/reject
POST /api/v1/vendor-risk/vendors/:id/remediations
POST /api/v1/vendor-risk/remediations/:id/complete
POST /api/v1/vendor-risk/vendors/:id/reviews
POST /api/v1/vendor-risk/reviews/:id/complete
GET  /api/v1/vendor-risk/metrics
```

## Seed

```powershell
npm run seed:vendor-risk
```
