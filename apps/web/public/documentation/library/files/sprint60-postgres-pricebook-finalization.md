---
title: "Sprint 60 - PostgreSQL Price Book Finalization"
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

# Sprint 60 - PostgreSQL Price Book Finalization

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

Apply this patch over Sprint 59.

## What changed

- Estimates now resolve service-code lines in PostgreSQL mode.
- Invoices now resolve service-code lines in PostgreSQL mode.
- Invoice `recordPayment` works in PostgreSQL mode.
- Added async price-book line resolver.
- Added service seeding helper.
- Added PostgreSQL indexes and runtime check table.

## Commands

```powershell
npm install
npm test
```

PostgreSQL mode:

```powershell
$env:DATA_STORE="postgres"
npm run migrate
npm run seed:services
npm run dev
```
