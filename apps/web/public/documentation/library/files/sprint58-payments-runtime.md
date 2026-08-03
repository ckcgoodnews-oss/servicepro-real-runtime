---
title: "Sprint 58 - Payments Runtime"
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

# Sprint 58 - Payments Runtime

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

Apply this patch over Sprint 57.

## What changed

- Added payment recording.
- Added payment repository.
- Added payment API routes.
- Invoice balances update when payment is posted.
- Invoice status updates to `partially_paid` or `paid`.
- Added payments RBAC permissions.
- Added PostgreSQL payment migration.

## Endpoints

```text
GET    /api/v1/payments
POST   /api/v1/payments
DELETE /api/v1/payments/:id
```

## Example body

```json
{
  "invoiceId": "inv_demo_1",
  "customerId": "cust_demo_1",
  "amount": 100,
  "method": "cash",
  "reference": "counter-payment"
}
```
