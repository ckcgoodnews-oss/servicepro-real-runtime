---
title: "Sprint 51 - Persistent Runtime Store and CRUD"
subtitle: "ServicePro product and operations documentation"
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

# Sprint 51 - Persistent Runtime Store and CRUD

> **Sprint documentation**
> ServicePro product and operations documentation

## Document Control

| Field | Detail |
|---|---|
| Purpose | Enterprise platform overview and buyer evaluation reference |
| Audience | Business leaders, platform administrators, evaluators, partners, and technical stakeholders |
| Scope | Capabilities, architecture, security, deployment, adoption, outcomes, and terminology |
| Source | ServicePro repository documentation; technical meaning preserved |

> [!NOTE]
> This publication edition improves navigation, document metadata, and cross-format consistency. Product and technical claims remain those of the source document.

Implemented:
- Persistent JSON datastore.
- Customer CRUD.
- Job CRUD.
- Validation helper functions.
- API smoke client.
- Runtime tests.

Example:

```powershell
npm run reset
npm run dev
```

Then:

```powershell
Invoke-RestMethod -Headers @{Authorization='Bearer dev-token-change-me'} http://localhost:3000/api/v1/customers
```
