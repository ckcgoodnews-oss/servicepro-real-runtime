---
title: "Sprint 86 - Payroll Export Runtime"
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

# Sprint 86 - Payroll Export Runtime

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

Apply this patch over Sprint 85.

## Endpoints to wire

```text
GET  /api/v1/payroll/periods
POST /api/v1/payroll/periods

GET  /api/v1/payroll/exports
POST /api/v1/payroll/exports/generate
GET  /api/v1/payroll/exports/:id
POST /api/v1/payroll/exports/:id/approve
POST /api/v1/payroll/exports/:id/mark-exported
```

## Seed

```powershell
npm run seed:payroll
```
