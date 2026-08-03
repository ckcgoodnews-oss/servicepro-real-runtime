---
title: "Sprint 119 - Continuous Control Monitoring"
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

# Sprint 119 - Continuous Control Monitoring

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

Apply this patch over Sprint 118.

## Endpoints to wire

```text
GET  /api/v1/control-monitoring/monitors
POST /api/v1/control-monitoring/monitors
GET  /api/v1/control-monitoring/monitors/:id/signals
POST /api/v1/control-monitoring/monitors/:id/signals
POST /api/v1/control-monitoring/monitors/:id/evaluate
GET  /api/v1/control-monitoring/evaluations
GET  /api/v1/control-monitoring/alerts
POST /api/v1/control-monitoring/alerts/:id/acknowledge
POST /api/v1/control-monitoring/alerts/:id/resolve
GET  /api/v1/control-monitoring/suppressions
POST /api/v1/control-monitoring/monitors/:id/suppressions
POST /api/v1/control-monitoring/suppressions/:id/revoke
GET  /api/v1/control-monitoring/metrics
```

## Seed

```powershell
npm run seed:control-monitoring
```
