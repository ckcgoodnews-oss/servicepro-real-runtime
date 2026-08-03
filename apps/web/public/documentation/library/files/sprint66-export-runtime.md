---
title: "Sprint 66 - Export Runtime"
subtitle: "Endpoints"
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

# Sprint 66 - Export Runtime

> **Sprint documentation**
> Endpoints

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 65.

## Endpoints

```text
GET  /api/v1/exports
POST /api/v1/exports
```

## Export keys

```text
customers
jobs
invoices
payments
inventory
portal-bookings
report-revenue
report-dashboard
report-inventory-value
```

## Example body

```json
{
  "exportKey": "customers"
}
```
