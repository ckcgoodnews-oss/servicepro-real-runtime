---
title: "Sprint 144 - Governance Dashboards and Executive Reporting"
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

# Sprint 144 - Governance Dashboards and Executive Reporting

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

Apply this patch over Sprint 143.

## Endpoints to wire

```text
GET  /api/v1/governance-reporting/kpis
POST /api/v1/governance-reporting/kpis
POST /api/v1/governance-reporting/kpis/:id/activate
POST /api/v1/governance-reporting/dashboards
POST /api/v1/governance-reporting/dashboards/:id/publish
GET  /api/v1/governance-reporting/dashboards/:id/widgets
POST /api/v1/governance-reporting/dashboards/:id/widgets
POST /api/v1/governance-reporting/templates
POST /api/v1/governance-reporting/templates/:id/activate
POST /api/v1/governance-reporting/snapshots
POST /api/v1/governance-reporting/snapshots/:id/generate
POST /api/v1/governance-reporting/snapshots/:id/fail
POST /api/v1/governance-reporting/deliveries
POST /api/v1/governance-reporting/deliveries/:id/send
POST /api/v1/governance-reporting/deliveries/:id/fail
POST /api/v1/governance-reporting/exports
POST /api/v1/governance-reporting/exports/:id/start
POST /api/v1/governance-reporting/exports/:id/complete
GET  /api/v1/governance-reporting/metrics
```

## Seed

```powershell
npm run seed:governance-reporting
```
