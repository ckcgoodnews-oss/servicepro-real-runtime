---
title: "Sprint 118 - Audit Readiness"
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

# Sprint 118 - Audit Readiness

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

Apply this patch over Sprint 117.

## Endpoints to wire

```text
GET  /api/v1/audit-readiness/engagements
POST /api/v1/audit-readiness/engagements
POST /api/v1/audit-readiness/engagements/:id/transition
GET  /api/v1/audit-readiness/requests
POST /api/v1/audit-readiness/engagements/:id/requests
POST /api/v1/audit-readiness/requests/:id/submit
POST /api/v1/audit-readiness/requests/:id/accept
POST /api/v1/audit-readiness/requests/:id/reject
GET  /api/v1/audit-readiness/requests/:id/evidence-packages
POST /api/v1/audit-readiness/requests/:id/evidence-packages
POST /api/v1/audit-readiness/evidence-packages/:id/ready
POST /api/v1/audit-readiness/evidence-packages/:id/submit
GET  /api/v1/audit-readiness/engagements/:id/walkthroughs
POST /api/v1/audit-readiness/engagements/:id/walkthroughs
POST /api/v1/audit-readiness/walkthroughs/:id/complete
GET  /api/v1/audit-readiness/engagements/:id/samples
POST /api/v1/audit-readiness/engagements/:id/samples
POST /api/v1/audit-readiness/samples/:id/collect
POST /api/v1/audit-readiness/samples/:id/submit
GET  /api/v1/audit-readiness/issues
POST /api/v1/audit-readiness/engagements/:id/issues
POST /api/v1/audit-readiness/issues/:id/management-response
POST /api/v1/audit-readiness/issues/:id/close
GET  /api/v1/audit-readiness/metrics
```

## Seed

```powershell
npm run seed:audit-readiness
```
