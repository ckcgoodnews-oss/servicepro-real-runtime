---
title: "Sprint 142 - SIEM and Detection Engineering"
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

# Sprint 142 - SIEM and Detection Engineering

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

Apply this patch over Sprint 141.

## Endpoints to wire

```text
GET  /api/v1/siem-detection/sources
POST /api/v1/siem-detection/sources
POST /api/v1/siem-detection/sources/:id/activate
POST /api/v1/siem-detection/sources/:id/degrade
GET  /api/v1/siem-detection/rules
POST /api/v1/siem-detection/rules
POST /api/v1/siem-detection/rules/:id/activate
POST /api/v1/siem-detection/rules/:id/disable
POST /api/v1/siem-detection/rules/:id/tests
POST /api/v1/siem-detection/tests/:id/run
GET  /api/v1/siem-detection/alerts
POST /api/v1/siem-detection/alerts
POST /api/v1/siem-detection/alerts/:id/triage
POST /api/v1/siem-detection/alerts/:id/investigate
POST /api/v1/siem-detection/alerts/:id/escalate
POST /api/v1/siem-detection/alerts/:id/close
POST /api/v1/siem-detection/alerts/:id/false-positive
POST /api/v1/siem-detection/suppressions
POST /api/v1/siem-detection/tunings
POST /api/v1/siem-detection/tunings/:id/approve
POST /api/v1/siem-detection/tunings/:id/apply
GET  /api/v1/siem-detection/metrics
```

## Seed

```powershell
npm run seed:siem-detection
```
