---
title: "Sprint 59 - Services and Price Book Runtime"
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

# Sprint 59 - Services and Price Book Runtime

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

Apply this patch over Sprint 58.

## What changed

- Added `/api/v1/services`.
- Added service catalog repository.
- Added plumbing service seed data.
- Added price-book line resolver.
- Estimates/invoices can now accept service-code lines.

## Example service-code estimate line

```json
{
  "customerId": "cust_demo_1",
  "jobId": "job_demo_1",
  "taxRate": 0.07,
  "lines": [
    { "serviceCode": "DRAIN-CLEAN", "quantity": 1 }
  ]
}
```

## Endpoints

```text
GET    /api/v1/services
POST   /api/v1/services
GET    /api/v1/services/:id
PATCH  /api/v1/services/:id
DELETE /api/v1/services/:id
```
