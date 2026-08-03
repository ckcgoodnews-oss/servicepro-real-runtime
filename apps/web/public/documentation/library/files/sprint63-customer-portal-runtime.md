---
title: "Sprint 63 - Customer Portal Runtime"
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

# Sprint 63 - Customer Portal Runtime

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

Apply this patch over Sprint 62.

## What changed

- Added portal accounts.
- Added portal login.
- Added portal bearer token.
- Added customer booking requests.
- Added customer-visible invoices and estimates.
- Added admin portal account endpoints.
- Added PostgreSQL migration.

## Portal test login

```text
customer@example.com / ChangeMe123!
```

## Portal endpoints

```text
POST /portal/login
GET  /portal/api/me
GET  /portal/api/bookings
POST /portal/api/bookings
GET  /portal/api/invoices
GET  /portal/api/estimates
```

## Admin endpoints

```text
GET  /api/v1/portal/accounts
POST /api/v1/portal/accounts
GET  /api/v1/portal/bookings
```
