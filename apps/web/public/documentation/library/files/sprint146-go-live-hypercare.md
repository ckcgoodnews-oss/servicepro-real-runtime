---
title: "Sprint 146 - Go-Live and Hypercare"
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

# Sprint 146 - Go-Live and Hypercare

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

Apply this patch over Sprint 145 RC1.

## Endpoints to wire

```text
POST /api/v1/go-live/checklist
POST /api/v1/go-live/checklist/:id/complete
POST /api/v1/go-live/checklist/:id/waive
POST /api/v1/go-live/cutovers
POST /api/v1/go-live/cutovers/:id/approve
POST /api/v1/go-live/cutovers/:id/start
POST /api/v1/go-live/cutovers/:id/complete
POST /api/v1/go-live/cutovers/:id/rollback
POST /api/v1/go-live/cutovers/:id/steps
POST /api/v1/go-live/steps/:id/start
POST /api/v1/go-live/steps/:id/complete
POST /api/v1/go-live/dns
POST /api/v1/go-live/dns/:id/validate
POST /api/v1/go-live/dns/:id/start-propagation
POST /api/v1/go-live/dns/:id/complete
POST /api/v1/go-live/communications
POST /api/v1/go-live/communications/:id/approve
POST /api/v1/go-live/communications/:id/send
POST /api/v1/go-live/rollback-decisions
POST /api/v1/go-live/rollback-decisions/:id/recommend
POST /api/v1/go-live/rollback-decisions/:id/approve
POST /api/v1/go-live/rollback-decisions/:id/execute
POST /api/v1/go-live/hypercare/issues
POST /api/v1/go-live/hypercare/issues/:id/resolve
POST /api/v1/go-live/hypercare/issues/:id/close
POST /api/v1/go-live/hypercare/reports
POST /api/v1/go-live/hypercare/reports/:id/publish
GET  /api/v1/go-live/ready
GET  /api/v1/go-live/metrics
```

## Seed

```powershell
npm run seed:go-live
```
