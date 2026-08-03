---
title: "Sprint 132 - Privacy Breach Notifications"
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

# Sprint 132 - Privacy Breach Notifications

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

Apply this patch over Sprint 131.

## Endpoints to wire

```text
GET  /api/v1/privacy-breach/incidents
POST /api/v1/privacy-breach/incidents
POST /api/v1/privacy-breach/incidents/:id/transition
GET  /api/v1/privacy-breach/incidents/:id/assessments
POST /api/v1/privacy-breach/incidents/:id/assessments
POST /api/v1/privacy-breach/assessments/:id/submit
POST /api/v1/privacy-breach/assessments/:id/approve
GET  /api/v1/privacy-breach/obligations
POST /api/v1/privacy-breach/incidents/:id/obligations
POST /api/v1/privacy-breach/obligations/:id/complete
POST /api/v1/privacy-breach/obligations/:id/waive
POST /api/v1/privacy-breach/obligations/mark-overdue
POST /api/v1/privacy-breach/incidents/:id/notices
POST /api/v1/privacy-breach/notices/:id/approve
POST /api/v1/privacy-breach/notices/:id/send
POST /api/v1/privacy-breach/notices/:id/fail
GET  /api/v1/privacy-breach/incidents/:id/evidence
POST /api/v1/privacy-breach/incidents/:id/evidence
GET  /api/v1/privacy-breach/metrics
```

## Seed

```powershell
npm run seed:privacy-breach
```
