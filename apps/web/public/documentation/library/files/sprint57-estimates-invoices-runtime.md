---
title: "Sprint 57 - Estimates, Invoices, and Pricing Runtime"
subtitle: "What changed"
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

# Sprint 57 - Estimates, Invoices, and Pricing Runtime

> **Sprint documentation**
> What changed

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Apply this patch over Sprint 56.

## What changed

- Added pricing calculation service.
- Added estimate repository.
- Added invoice repository.
- Added estimates API.
- Added invoices API.
- Added RBAC permissions for estimates/invoices.
- Added JSON seed records.
- Added PostgreSQL migration.

## Example endpoints

```text
GET  /api/v1/estimates
POST /api/v1/estimates
GET  /api/v1/invoices
POST /api/v1/invoices
```

## Example body

```json
{
  "customerId": "cust_demo_1",
  "jobId": "job_demo_1",
  "taxRate": 0.07,
  "lines": [
    {
      "code": "DRAIN-CLEAN",
      "name": "Drain cleaning",
      "quantity": 1,
      "unitPrice": 225,
      "unitCost": 85,
      "taxable": true
    }
  ]
}
```
